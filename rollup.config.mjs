import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';

export default {
    input: 'src/index.mjs',
    output: {
        file: './dist/erebus-core.min.js',
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