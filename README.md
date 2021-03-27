# @starfleet/esbuild-minimizer

Use [esbuild](https://github.com/evanw/esbuild) as minifier for webpack.

## What is this package?

从 https://github.com/sorrycc/esbuild-webpack-plugin 修改而来

## Install

```shell
npm i @starfleet/esbuild-minimizer
```

```js
const ESBuildMinimizerPlugin = require('@starfleet/esbuild-minimizer');

module.exports = {
  optimization: {
    minimizer: [
      new ESBuildMinimizerPlugin({
        include?: Filter | Filter[],
        exclude?: Filter | Filter[],
        minify?: Boolean, // 如果为 true 会覆盖👇的配置为 true
        minifyWhitespace?: Boolean,
        minifyIdentifiers?: Boolean,
        minifySyntax?: Boolean,
        // esbuild minify 的详情请看 https://esbuild.github.io/api/#minify
        // ... 可以传入其他 esbuild 参数
      }),
    ],
  },
};
```

## LICENSE

MIT
