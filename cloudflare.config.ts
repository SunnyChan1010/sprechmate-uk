import { defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    "name": "sprechmate-uk",
    "compatibilityDate": "2026-10-06",
    "observability": {
      "enabled": true
    }
  }
});
