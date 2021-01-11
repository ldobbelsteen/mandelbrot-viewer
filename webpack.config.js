const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const ESLintPlugin = require("eslint-webpack-plugin")

module.exports = {
	entry: {
		bundle: "./src/main.js",
		worker: "./src/worker/main.js"
	},
	plugins: [
		new ESLintPlugin(),
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			template: "./src/index.html",
			favicon: "./src/favicon.png",
			scriptLoading: "defer"
		})
	],
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "[name].[contenthash].js",
	},
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"]
			},
			{
				test: /\.js$/,
				use: ["worker-loader"],
				include: path.resolve(__dirname, "./src/worker")
			},
			{
				test: /\.(woff2|woff|eot|ttf|otf|png)$/i,
				type: "asset/resource"
			}
		]
	}
}
