import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["cjs"],
    outDir: "dist/cjs",
    sourcemap: true,
    dts: true,
    clean: true,
  },
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    outDir: "dist/esm",
    sourcemap: true,
    dts: true,
    clean: true,
  },
]);
