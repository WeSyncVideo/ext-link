const path = require('path')

const root = (...paths) => path.join(__dirname, ...paths)

module.exports = () => ({
  mode: 'production',
  devtool: 'source-map',
  cache: true,
  entry: {
    foreground: root('src', 'index.ts'),
  },
  output: {
    path: root('dist'),
    filename: '[name].js',
    library: 'extLink'
  },
  target: 'web',
  resolve: {
    extensions: ['.ts'],
  },
  module: {
    rules: [{
        test: /\.ts$/,
        enforce: 'pre',
        use: [{
          loader: 'tslint-loader',
          options: {
            configFile: root('tslint.json'),
            tsConfigFile: root('tsconfig.json'),
            typeCheck: true,
          }
        }]
      },
      {
        test: /\.tsx?$/,
        use: [{
            loader: 'babel-loader',
            options: {
              babelrc: true,
            },
          },
          {
            loader: 'ts-loader'
          },
        ]
      },
    ],
  },
})
