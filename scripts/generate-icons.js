import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const sourceLogo = path.join(
  __dirname,
  "../public/logo-resonance-transparant.png"
);
const outputDir = path.join(__dirname, "../public/icons");

// Create icons directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  try {
    for (const size of sizes) {
      await sharp(sourceLogo)
        .resize(size, size)
        .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
      console.log(`Generated ${size}x${size} icon`);
    }
    console.log("All icons generated successfully!");
  } catch (error) {
    console.error("Error generating icons:", error);
  }
}

generateIcons();
