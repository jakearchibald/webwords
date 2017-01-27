module.exports = {
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 7,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
      modules: true,
      es6: true
    }
  },
  "plugins": [
    "react"
  ]
};