// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";
import js from "@eslint/js";

// Your custom configs here
export default withNuxt([
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.vue"],
    rules: {
      "no-undef": "off",
    },
  },
  {
    rules: {
      "@typescript-eslint/unified-signatures": "off",
      "vue/valid-v-slot": "error",
      "vue/v-slot-style": [
        "error",
        { atComponent: "v-slot", default: "v-slot", named: "longform" },
      ],
      "no-unused-vars": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "vue/html-self-closing": "off",
    },
  },
]);
