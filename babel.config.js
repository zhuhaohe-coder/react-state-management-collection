module.exports = {
  babelrc: false, //不要使用任何外部的.babelrc配置文件，从而避免配置冲突。
  ignore: ["/node_modules/"], //指定 Babel 应该忽略的文件路径
  presets: [["@babel/preset-env", { loose: true, modules: false }]],
  plugins: [
    [
      "@babel/plugin-transform-react-jsx",
      {
        runtime: "automatic",
      },
    ],
    ["@babel/plugin-transform-typescript", { isTSX: true }],
  ],
};
