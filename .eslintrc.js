module.exports = {
  "env": {
    "commonjs": true,
    "es2021": true,
    "node": true,
    // https://eslint.org/docs/user-guide/configuring/language-options#specifying-environments
    "jest": true
  },
  "extends": "eslint:recommended",
  "overrides": [
    {
      "env": {
        "node": true
      },
      "files": [
        ".eslintrc.{js,cjs}"
      ],
      "parserOptions": {
        "sourceType": "script"
      }
    }
  ],
  "parserOptions": {
    "ecmaVersion": "latest"
  },
  "rules": {
  }
}
