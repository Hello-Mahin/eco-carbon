export default [
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        fetch: "readonly",
        HTMLElement: "readonly",
        Chart: "readonly",
        lucide: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        console: "readonly",
        confirm: "readonly",
        URLSearchParams: "readonly",
        Element: "readonly",
        CustomEvent: "readonly",
        HTMLInputElement: "readonly",
        HTMLSelectElement: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-console": "off",
      "eqeqeq": "warn",
      "curly": "error"
    }
  }
];
