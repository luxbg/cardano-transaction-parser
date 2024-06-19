import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/cjs.ts"],
    format: ["cjs"],
    outDir: "dist/cjs",
    sourcemap: true,
    dts: true,
    clean: true,
  },
  {
    entry: ["src/mjs.ts"],
    format: ["esm"],
    outDir: "dist/esm",
    sourcemap: true,
    dts: true,
    clean: true,
  },
]);
