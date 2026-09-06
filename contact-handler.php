<?php
/**
 * Contact form handler for the WISA website.
 *
 * Sends mail via SMTP authentication against the info@wisa.co.za mailbox
 * (PHPMailer), not PHP's mail() function, since mail() is frequently
 * dropped or spam-filtered by receiving servers on shared hosting.
 *
 * Requires:
 *   - `composer install` run locally to generate /vendor (Xneelo shared
 *     hosting does not run Composer for you; upload the resulting /vendor
 *     folder alongside this file).
 *   - mail-config.php present alongside this file, with real SMTP
 *     credentials for the info@wisa.co.za mailbox (see that file's
 *     comments for the Xneelo cPanel setup steps).
 *
 * NOT YET TESTED END TO END: there is no PHP runtime in the environment
 * this was written in, and no Xneelo mailbox exists yet, so this has not
 * been executed. Test it against the real mailbox (Xneelo cPanel) before
 * relying on it, per the deployment checklist in the build brief.
 */

declare(strict_types=1);

session_start();

header('Content-Type: application/json; charset=utf-8');

// Only POST is meaningful for a form submission.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'This endpoint only accepts form submissions.',
    ]);
    exit;
}

/**
 * Basic rate limiting: reject more than 3 submissions from the same
 * session within a 10 minute window. This is deliberately simple per the
 * build brief ("does not need to be sophisticated") rather than a full
 * abuse-prevention system.
 */
const RATE_LIMIT_MAX_SUBMISSIONS = 3;
const RATE_LIMIT_WINDOW_SECONDS = 600;

function isRateLimited(): bool
{
    $now = time();
    $timestamps = $_SESSION['contact_submissions'] ?? [];

    // Drop anything outside the current window before counting.
    $timestamps = array_values(array_filter(
        $timestamps,
        static fn(int $timestamp): bool => ($now - $timestamp) < RATE_LIMIT_WINDOW_SECONDS
    ));

    if (count($timestamps) >= RATE_LIMIT_MAX_SUBMISSIONS) {
        $_SESSION['contact_submissions'] = $timestamps;
        return true;
    }

    $timestamps[] = $now;
    $_SESSION['contact_submissions'] = $timestamps;
    return false;
}

if (isRateLimited()) {
    http_response_code(429);
    echo json_encode([
        'success' => false,
        'message' => 'Too many messages sent recently. Please wait a few minutes and try again, or call us directly.',
    ]);
    exit;
}

/**
 * Strip characters that could be used for email header injection
 * (carriage returns, line feeds) from any value that might end up in an
 * email header (name, email, phone), then trim whitespace.
 */
function sanitiseHeaderValue(string $value): string
{
    $value = str_replace(["\r", "\n", "%0a", "%0d"], '', $value);
    return trim($value);
}

$name = sanitiseHeaderValue((string) ($_POST['name'] ?? ''));
$email = sanitiseHeaderValue((string) ($_POST['email'] ?? ''));
$phone = sanitiseHeaderValue((string) ($_POST['phone'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));
$honeypot = trim((string) ($_POST['company'] ?? ''));

// Honeypot: real visitors never see or fill in this field (it's hidden
// off-canvas and unreachable by keyboard). If it has a value, this is a
// bot. Log it and respond as if the message was sent, without actually
// sending anything or telling the bot it was caught.
if ($honeypot !== '') {
    error_log('Contact form: honeypot triggered, submission discarded.');
    echo json_encode([
        'success' => true,
        'message' => 'Thank you. Your message has been sent.',
    ]);
    exit;
}

// Server-side validation. The frontend validates too, but this is the
// check that actually matters: never trust client-side validation alone.
$errors = [];

if ($name === '') {
    $errors['name'] = 'Please enter your name.';
}

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Please enter a valid email address.';
}

if ($message === '') {
    $errors['message'] = 'Please enter a message.';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Please check the highlighted fields and try again.',
        'errors' => $errors,
    ]);
    exit;
}

$vendorAutoload = __DIR__ . '/vendor/autoload.php';
if (!is_file($vendorAutoload)) {
    error_log('Contact form: vendor/autoload.php missing. Run "composer install" and upload /vendor.');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'The contact form is not fully set up yet. Please call or email us directly.',
    ]);
    exit;
}
require $vendorAutoload;

$configPath = __DIR__ . '/mail-config.php';
if (!is_file($configPath)) {
    error_log('Contact form: mail-config.php is missing.');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'The contact form is not fully set up yet. Please call or email us directly.',
    ]);
    exit;
}
/** @var array<string, mixed> $config */
$config = require $configPath;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = $config['smtp_host'];
    $mail->SMTPAuth = true;
    $mail->Username = $config['smtp_username'];
    $mail->Password = $config['smtp_password'];
    $mail->SMTPSecure = $config['smtp_secure'] === 'tls'
        ? PHPMailer::ENCRYPTION_STARTTLS
        : PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port = (int) $config['smtp_port'];

    $mail->setFrom($config['from_email'], $config['from_name']);
    $mail->addAddress($config['to_email']);
    // Replying to the notification email goes straight to the visitor,
    // without WISA's own mailbox sending "as" an address it doesn't own
    // (which SPF/DKIM checks on the receiving end would likely flag).
    $mail->addReplyTo($email, $name);

    $mail->Subject = sprintf('New website enquiry from %s', $name);
    $mail->isHTML(false);
    $mail->Body = implode("\n", [
        "New enquiry submitted through the WISA website contact form.",
        "",
        "Name: {$name}",
        "Email: {$email}",
        "Phone: " . ($phone !== '' ? $phone : 'Not provided'),
        "",
        "Message:",
        $message,
    ]);

    $mail->send();

    echo json_encode([
        'success' => true,
        'message' => 'Thank you. Your message has been sent, and we will be in touch soon.',
    ]);
} catch (PHPMailerException $exception) {
    // Log the technical detail server-side; never expose SMTP internals
    // to the visitor.
    error_log('Contact form: PHPMailer error: ' . $mail->ErrorInfo);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Something went wrong sending your message. Please call or email us directly.',
    ]);
}
