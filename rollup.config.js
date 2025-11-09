import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

const config = [
    // CommonJS build
    {
        input: 'src/index.js',
        output: {
            file: 'dist/index.js',
            format: 'cjs',
            exports: 'auto'
        },
        plugins: [
            resolve(),
            babel({
                babelHelpers: 'bundled',
                presets: ['@babel/preset-env']
            })
        ]
    },
    // ES Module build
    {
        input: 'src/index.js',
        output: {
            file: 'dist/index.esm.js',
            format: 'esm'
        },
        plugins: [
            resolve(),
            babel({
                babelHelpers: 'bundled',
                presets: ['@babel/preset-env']
            })
        ]
    },
    // UMD build for browsers
    {
        input: 'src/browser.js',
        output: {
            file: 'dist/index.umd.js',
            format: 'umd',
            name: 'JSCal',
            exports: 'auto'
        },
        plugins: [
            resolve(),
            commonjs(),
            babel({
                babelHelpers: 'bundled',
                presets: ['@babel/preset-env']
            }),
            terser()
        ]
    }
];

export default config;
