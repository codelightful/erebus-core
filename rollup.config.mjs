import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import pkg from './package.json' assert {type: "json"};

export default {
    input: 'src/erebus.mjs',
    output: {
        file: pkg.browser,
        format: 'umd',
        name: 'Erebus',
        sourcemap: true
    },
    watch: {
        exclude: 'node_modules/**',
        include: './src/**'
    },
    plugins: [
		resolve(),
        babel({ 
			exclude: 'node_modules/**',
            babelHelpers: 'bundled' 
        }),
		terser()
    ]
};