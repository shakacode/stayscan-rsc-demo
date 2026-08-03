// ESLint config for client-side JS/JSX (source under app/src). Generated webpack
// configs and generated packs are excluded via .eslintignore.
module.exports = {
  root: true,
  env: { browser: true, es2023: true, node: true, jest: true },
  parserOptions: {
    ecmaVersion: 2023,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: { react: { version: 'detect' } },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    // Props are validated by the backend contract, not PropTypes, in this app.
    'react/prop-types': 'off',
  },
};
