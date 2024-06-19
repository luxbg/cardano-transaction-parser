import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/cjs.ts"],
    target: "es6",
    format: ["cjs"],
    outDir: "dist/cjs",
    dts: false,
    clean: true,
  },
  {
    entry: ["src/mjs.ts"],
    format: ["esm"],
    outDir: "dist/esm",
    dts: true,
    clean: true,
  },
]);
