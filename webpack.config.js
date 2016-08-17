var path = require('path');

//var version = require('./package.json').version;

module.exports = {
	entry: {
		picker: './src/picker/picker.js'
	},
	output: {
		path: __dirname + '/build',
		publicPath: '/assets/',
		filename: '[name].js'
	},
	module: {
		loaders: [
			{
				test: /\.styl$/,
				loader: 'style-loader!css-loader!stylus-loader'
			},
			{
				test: /\.png|\.gif$/,
				loader: 'url-loader?limit=8192'
			},
			{
				test: /\.handlebars$/,
				loader: "handlebars-loader"
			}
		]
	},
	resolveLoader: {
		root: path.join(__dirname, 'node_modules')
	}
};