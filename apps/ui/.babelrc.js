const webpack = require('webpack')

module.exports = function (api) {
  api.cache(true)

  if (
    process.env.NX_TASK_TARGET_TARGET === 'build' ||
    process.env.NX_TASK_TARGET_TARGET?.includes('storybook')
  ) {
    return {
      plugins: [
        new webpack.DefinePlugin({
          __DEV__: process.env.NODE_ENV === 'development',
        }),
      ],
      presets: [
        [
          '@nx/react/babel',
          {
            runtime: 'automatic',
          },
        ],
      ],
    }
  }

  return {
    plugins: [
      new webpack.DefinePlugin({
        __DEV__: process.env.NODE_ENV === 'development',
      }),
    ],
    presets: [
      ['module:@react-native/babel-preset', { useTransformReactJSX: true }],
    ],
  }
}
