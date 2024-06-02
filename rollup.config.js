const createBabelConfig = require("./babel.config.js");
//用于帮助 Rollup 解析第三方模块的导入。在 JavaScript 中，当你使用 import 语句导入模块时，需要一个机制来定位和加载这些模块。
const resolve = require("@rollup/plugin-node-resolve");
//用于集成 Babel 编译器到 Rollup 打包过程。
const babelPlugin = require("@rollup/plugin-babel");
//将 CommonJS 模块转换为 ES6 模块。这个插件对于处理那些以 CommonJS 格式编写的第三方模块（通常是在 Node.js 环境中使用的模块）非常有用。
const commonjs = require("@rollup/plugin-commonjs");
//用于处理 TypeScript 的类型声明文件（*.d.ts）
const { dts } = require("rollup-plugin-dts");
const { format } = require("path");

const extensions = [".ts", ".tsx"]; //默认情况下 Rollup 只会解析 JavaScript 文件

function getBabelOptions() {
  return {
    ...createBabelConfig,
    extensions,
    babelHelpers: "bundled",
    comments: false,
  };
}

// 生成Typescript定义
function createDeclarationConfig(input, output) {
  return {
    input: `${input}/src/index.ts`,
    output: {
      file: output,
      format: "esm",
    },
    plugins: [dts()],
  };
}
// 生成ESM
function createESMConfig(input, output) {
  return {
    input,
    output: { file: output, format: "esm" },
    plugins: [
      resolve({ extensions }),
      commonjs(), //将 CommonJS 模块转换为 ES6 模块，使得 Rollup 可以处理它们
      babelPlugin(getBabelOptions()),
    ],
  };
}
// 生成CommonJS
function createCommonJSConfig(input, output) {
  return {
    input,
    output: { file: output, format: "cjs" },
    plugins: [
      resolve({ extensions }),
      commonjs(),
      babelPlugin(getBabelOptions()),
    ],
  };
}
// 生成UMD
function createUMDConfig(input, output, name) {
  return {
    input,
    output: { file: output, format: "umd", name },
    plugins: [
      resolve({ extensions }),
      commonjs(),
      babelPlugin(getBabelOptions()),
    ],
  };
}

module.exports = (args) => {
  const packageName = args.package;

  const input = `packages/${packageName}`;
  const output = `packages/${packageName}/dist`;

  return [
    createDeclarationConfig(input, output),
    createESMConfig(`${input}/src/index.ts`, `${output}/index.mjs`),
    createCommonJSConfig(`${input}/src/index.ts`, `${output}/index.cjs.js`),
    createUMDConfig(
      `${input}/src/index.ts`,
      `${output}/index.umd.js`,
      packageName
    ),
  ];
};
