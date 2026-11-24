<?php
declare(strict_types=1);

session_start();

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'This endpoint only accepts form submissions.',
    ]);
    exit;
}

const RATE_LIMIT_MAX_SUBMISSIONS = 3;
const RATE_LIMIT_WINDOW_SECONDS = 600;

function isRateLimited(): bool
{
    $now = time();
    $timestamps = $_SESSION['contact_submissions'] ?? [];

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

if ($honeypot !== '') {
    error_log('Contact form: honeypot triggered, submission discarded.');
    echo json_encode([
        'success' => true,
        'message' => 'Thank you. Your message has been sent.',
    ]);
    exit;
}

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
    error_log('Contact form: PHPMailer error: ' . $mail->ErrorInfo);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Something went wrong sending your message. Please call or email us directly.',
    ]);
}
