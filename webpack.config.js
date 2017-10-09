const path = require( 'path' );
const process = require( 'process' );
const webpack = require( 'webpack' );

const IS_PRODUCTION_ENV = process.env.NODE_ENV === 'production';
const SOURCEMAPS = process.env.SOURCEMAPS === 'true';

const PROJECT_PATH = process.cwd();
const SRC_PATH = path.join( PROJECT_PATH, 'src' );
const BUILD_PATH = path.join( PROJECT_PATH, 'build' );
const JS_PATH = path.join( SRC_PATH, 'js' );
const SCSS_PATH = path.join( SRC_PATH, 'scss' );

const jsPattern = /\.jsx?$/;
const browsers = [ 'last 2 versions' ];

const BrowserSyncPlugin = require( 'browser-sync-webpack-plugin' );
const ExtractTextPlugin = require( 'extract-text-webpack-plugin' );
const extractSass = new ExtractTextPlugin( {
    filename: 'css/[name].css'
} );

const config = {
    entry: {
        app: [
            'babel-polyfill',
            path.join( JS_PATH, 'app.js' ),
            path.join( SCSS_PATH, 'styles.scss' )
        ]
    },
    output: {
        path: BUILD_PATH,
        filename: 'js/[name].js'
    },
    devtool: SOURCEMAPS ? '#inline-source-map' : false,
    module: {
        rules: [
            {
                test: jsPattern,
                include: SRC_PATH,
                exclude: [ /\.spec\.js$/, /node_modules/ ],
                loader: 'eslint-loader',
                enforce: 'pre',
                options: {
                    configFile: path.join( PROJECT_PATH, '.eslintrc' )
                }
            },
            {
                test: jsPattern,
                include: SRC_PATH,
                exclude: [ /node_modules/ ],
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true,
                    presets: [
                        [ 'env', {
                            targets: {
                                browsers
                            }
                        } ]
                    ],
                    plugins: [
                        'add-module-exports',
                        'syntax-class-properties',
                        'transform-class-properties'
                    ]
                }
            },
            {
                test: /\.scss$/,
                use: extractSass.extract( {
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                minimize: IS_PRODUCTION_ENV,
                                sourceMap: SOURCEMAPS
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                plugins: [ require( 'autoprefixer' )(
                                    {
                                        browsers
                                    }
                                ) ],
                                sourceMap: SOURCEMAPS
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                precision: 8,
                                outputStyle: 'expanded',
                                sourceMap: SOURCEMAPS
                            }
                        }
                    ],
                } )
            }
        ]
    },
    plugins: [
        extractSass,
        new BrowserSyncPlugin( {
            host: 'localhost',
            port: 3000,
            proxy: 'http://localhost:8000'
        } )
    ],
    resolve: {
        modules: [ JS_PATH, 'node_modules' ],
        extensions: [ '*', '.js', '.json' ]
    }
};

if ( IS_PRODUCTION_ENV ) {
    const uglifyOptions = {
        warnings: true,
        compress: {
            screw_ie8: true
        },
        mangle: {
            screw_ie8: true
        },
        mangleProperties: true
    };

    config.plugins.push( new webpack.optimize.UglifyJsPlugin( uglifyOptions ) );
}

module.exports = config;
