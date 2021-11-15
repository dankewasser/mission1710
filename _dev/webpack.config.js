var webpack = require('webpack');

module.exports = {
    debug: true,
    entry: {
        app: './js/app.js',
        cmn: './js/cmn.js'
    },
    output: {
        filename: '[name].js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                  presets: ['es2015']
                }
            }
        ]
    },
    devtool: '#source-map',
    resolve: {
        extensions: ['', '.js']
    },
    plugins: [
        // new webpack.optimize.UglifyJsPlugin(),
    ]
};
