import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Feature pages load data with `useEffect(() => { void load(); }, [load])`.
      // That works, but React's newer rule flags it. Kept as a visible warning
      // (not an error) until these pages move to server-side fetching or a data hook.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
