import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
import resolve from '@rollup/plugin-node-resolve';

export default {
    input: 'src/erebus.mjs',
    output: {
        file: './dist/erebus-core.min.js',
        format: 'iife',
        name: 'Erebus',
        sourcemap: true,
        plugins: [
            terser()
        ]
    },
    watch: {
        exclude: 'node_modules/**',
        include: './src/**'
    },
    plugins: [
        resolve(),
		postcss({
			extensions: ['.css']
		}),
        babel({ 
            exclude: "node_modules/**",
            babelHelpers: 'bundled' 
        })
    ]
};