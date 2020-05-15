const path = require('path');

module.exports = {
	mode:'development',
	entry: './src/index.js',
	devtool:'inline-source-map',
	devServer:{
		contentBase:'./dist',
		port:7781
	},
	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, 'dist')
	}
};