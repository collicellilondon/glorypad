const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const nestedWebDist = path.join(root, "web-dist");
const sourceDir = fs.existsSync(path.join(nestedWebDist, "index.html")) ? nestedWebDist : root;
const outDir = path.join(root, "www");

const files = ["index.html", "styles.css", "app.js", "tuner-core.js", "tuner-audio.js", "site.webmanifest", "politicadeprivacidade.html"];
const assetDirs = [
  "assets/icons",
  "assets/pads-foundations",
  "assets/pads-organic",
  "assets/pads-studio",
  "assets/pads-warm",
];

function copyFile(source, target) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function copyDir(source, target) {
  if (!fs.existsSync(source)) {
    throw new Error(`Missing required asset directory: ${path.relative(root, source)}`);
  }

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      copyDir(sourcePath, targetPath);
    } else if (entry.isFile()) {
      copyFile(sourcePath, targetPath);
    }
  }
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const file of files) {
  copyFile(path.join(sourceDir, file), path.join(outDir, file));
}

for (const dir of assetDirs) {
  copyDir(path.join(sourceDir, dir), path.join(outDir, dir));
}

console.log(`Prepared Capacitor web bundle at ${path.relative(root, outDir)}`);
