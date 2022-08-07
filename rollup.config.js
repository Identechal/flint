import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonJs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: 'index.js',
  output: {
    file: 'bundle.cjs',
    format: 'cjs',
  },
  plugins: [nodeResolve({ preferBuiltins: true }), commonJs(), json()],
};
