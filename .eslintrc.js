module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },

  extends: ['airbnb-base'],

  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'class-methods-use-this': 0,
    'template-curly-spacing': ['error', 'never'],
    'object-curly-newline': ['error', { consistent: true }],
  },
};
