import { SitemapStream, streamToPromise } from "sitemap";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = "https://manaedlapandalu.com";

// Only SEO-safe, public routes
const routes = [
  "/",
  "/teams",
  "/active-teams",
  "/owners",
  "/bulls",
  "/drivers",
  "/events",
  "/stats",
];

async function generateSitemap() {
  const sitemap = new SitemapStream({ hostname: SITE_URL });

  routes.forEach((route) => {
    sitemap.write({
      url: route,
      changefreq: "weekly",
      priority: route === "/" ? 1.0 : 0.8,
    });
  });

  sitemap.end();

  const data = await streamToPromise(sitemap);

  fs.writeFileSync(path.resolve(__dirname, "../public/sitemap.xml"), data);

  console.log("✅ sitemap.xml generated successfully");
}

generateSitemap();
