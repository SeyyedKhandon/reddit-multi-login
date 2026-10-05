// Builds the extension into dist/. Two passes because a content script cannot
// import ES modules: it has to be one self-contained file, while the worker and
// popup are free to share chunks.
//
//   npm run build          one-off build
//   npm run dev            rebuild on change (load dist/ as an unpacked extension)
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build, type InlineConfig } from "vite";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = resolve(ROOT, "src");
const DIST = resolve(ROOT, "dist");
const watch = process.argv.includes("--watch");

const shared: InlineConfig = {
  configFile: false,
  root: SRC,
  base: "./",
  logLevel: "info",
};

const pages: InlineConfig = {
  ...shared,
  publicDir: resolve(ROOT, "public"),
  build: {
    outDir: DIST,
    emptyOutDir: true,
    target: "es2022",
    sourcemap: watch,
    modulePreload: false,
    watch: watch ? {} : null,
    rollupOptions: {
      input: {
        background: resolve(SRC, "background/index.ts"),
        popup: resolve(SRC, "popup/index.html"),
      },
      output: {
        entryFileNames: (chunk) =>
          chunk.name === "background" ? "background.js" : "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
};

const content: InlineConfig = {
  ...shared,
  publicDir: false,
  build: {
    outDir: DIST,
    emptyOutDir: false,
    target: "es2022",
    sourcemap: watch,
    watch: watch ? {} : null,
    lib: {
      entry: resolve(SRC, "content/index.ts"),
      formats: ["iife"],
      name: "RedditAccountSwitcherContent",
      fileName: () => "content.js",
    },
  },
};

await build(pages);
await build(content);
