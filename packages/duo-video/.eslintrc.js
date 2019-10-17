module.exports = {
  "extends": "airbnb",
  "plugins": [
    "react",
    "import",
    "react-hooks"
  ],
  "rules": {
      "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],
      "react/no-array-index-key": "off",
      "import/no-extraneous-dependencies": "off",
      "padded-blocks": 1,
      "no-return-assign": ["error", "except-parens"],
      "no-plusplus": [ "error", {
        "allowForLoopAfterthoughts": true
      }]
  },
  "parser": "babel-eslint",
  "env": {
    "jest": true
  },
};
