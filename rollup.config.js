import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonJs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

const npmPackage = require(process.cwd() + '/package.json');

export default {
  input: npmPackage.main,
  output: {
    file: npmPackage.bin,
    format: 'cjs',
  },
  plugins: [nodeResolve({ preferBuiltins: true }), commonJs(), json()],
};
