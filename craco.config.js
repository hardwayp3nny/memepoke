module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          crypto: require.resolve('crypto-browserify'),
          stream: require.resolve('stream-browserify'),
          buffer: require.resolve('buffer/'),
          http: require.resolve('stream-http'),
          https: require.resolve('https-browserify'),
          os: require.resolve('os-browserify/browser'),
          url: require.resolve('url/'),
          assert: require.resolve('assert/'),
          zlib: require.resolve('browserify-zlib'),
          path: require.resolve('path-browserify'),
          fs: false,
          net: false,
          tls: false,
          child_process: false,
        },
      },
    },
  },
}; 