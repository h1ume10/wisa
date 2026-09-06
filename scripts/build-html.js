#!/usr/bin/env node
/**
 * Tiny static-site assembler.
 *
 * This is a LOCAL, DEV-TIME-ONLY build step — it runs on the developer's
 * machine before upload, exactly like the Tailwind CLI does for CSS. It
 * stitches the shared header/footer partials into each page's content and
 * writes plain, flat .html files to the project root. Nothing here runs on
 * the server; Xneelo only ever receives the generated static HTML/CSS/JS/PHP
 * files, so this does not count as a server-side framework or dependency.
 *
 * Why this exists: six pages hand-edited independently drift out of sync
 * over time (a nav label, phone number, or footer link updated on one page
 * and missed on another). This keeps one source of truth for the header and
 * footer while still shipping pure static files.
 *
 * Usage:
 *   node scripts/build-html.js            (build once)
 *   node scripts/build-html.js --watch    (rebuild on change to src/)
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PARTIALS_DIR = path.join(ROOT, "src", "partials");
const PAGES_DIR = path.join(ROOT, "src", "pages");

/** @type {{slug:string, navKey:string, title:string, description:string}[]} */
const PAGES = [
  {
    slug: "index",
    navKey: "home",
    title: "WISA | Workplace Investigations SA",
    description:
      "WISA is a professional services firm of attorneys, labour law practitioners and former CCMA Commissioners, providing workplace investigation advisory, consulting and training across South Africa."
  },
  {
    slug: "about",
    navKey: "about",
    title: "About Us | Workplace Investigations SA (WISA)",
    description:
      "Learn who WISA is: a multidisciplinary firm of attorneys and former Bargaining Council and CCMA Commissioners, and the work ethic and philosophy that guides our investigations."
  },
  {
    slug: "legal-framework",
    navKey: "legal",
    title: "Legal Framework | Workplace Investigations SA (WISA)",
    description:
      "How South African law governs workplace investigations: the Labour Relations Act, the Code of Good Practice, and the constitutional right to fair labour practices."
  },
  {
    slug: "team",
    navKey: "team",
    title: "Our Team | Workplace Investigations SA (WISA)",
    description:
      "Meet the WISA directors: attorneys, labour law and labour relations practitioners, and former Bargaining Council and CCMA Commissioners."
  },
  {
    slug: "services",
    navKey: "services",
    title: "Our Services | Workplace Investigations SA (WISA)",
    description:
      "WISA's services: content development, advisory, training and consulting for workplace investigations, for HR, ER, legal, compliance and trade union practitioners."
  },
  {
    slug: "contact",
    navKey: "contact",
    title: "Contact Us | Workplace Investigations SA (WISA)",
    description:
      "Contact Workplace Investigations SA (WISA) in Centurion, Pretoria. Call, email, or send a message through our contact form."
  },
  {
    slug: "404",
    navKey: "",
    title: "Page Not Found | Workplace Investigations SA (WISA)",
    description:
      "The page you were looking for could not be found. Return to the WISA homepage or use the menu to find what you need."
  }
];

function readPartial(name) {
  return fs.readFileSync(path.join(PARTIALS_DIR, name), "utf8");
}

function withActiveNav(html, navKey) {
  // Mark every instance of the current page's link (desktop nav, mobile nav,
  // footer sitemap) as the current page, for both assistive tech and the
  // aria-current styling hook defined in src/input.css.
  const pattern = new RegExp(`data-nav="${navKey}"`, "g");
  return html.replace(pattern, `data-nav="${navKey}" aria-current="page"`);
}

function buildPage(page, layout, headerTemplate, footerTemplate) {
  const contentPath = path.join(PAGES_DIR, `${page.slug}.html`);
  if (!fs.existsSync(contentPath)) {
    throw new Error(`Missing content file: src/pages/${page.slug}.html`);
  }
  const content = fs.readFileSync(contentPath, "utf8");

  const header = withActiveNav(headerTemplate, page.navKey);
  const footer = withActiveNav(footerTemplate, page.navKey);
  const canonicalPath = page.slug === "index" ? "" : `${page.slug}.html`;

  const html = layout
    .split("__TITLE__").join(page.title)
    .split("__DESCRIPTION__").join(page.description)
    .split("__CANONICAL__").join(canonicalPath)
    .replace("__HEADER__", () => header)
    .replace("__CONTENT__", () => content)
    .replace("__FOOTER__", () => footer);

  const outPath = path.join(ROOT, `${page.slug}.html`);
  fs.writeFileSync(outPath, html, "utf8");
  console.log(`Built ${page.slug}.html`);
}

function buildAll() {
  const layout = readPartial("layout.html");
  const headerTemplate = readPartial("header.html");
  const footerTemplate = readPartial("footer.html").replace(
    /__YEAR__/g,
    String(new Date().getFullYear())
  );

  PAGES.forEach((page) => buildPage(page, layout, headerTemplate, footerTemplate));
}

buildAll();

if (process.argv.includes("--watch")) {
  console.log("Watching src/ for changes... (Ctrl+C to stop)");
  fs.watch(path.join(ROOT, "src"), { recursive: true }, () => {
    try {
      buildAll();
    } catch (err) {
      console.error(err.message);
    }
  });
}
