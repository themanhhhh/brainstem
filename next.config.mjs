export default {
    reactStrictMode: true,
    devIndicators: {
      buildActivity: false,
    },
    webpack(config, { isServer }) {
      if (!isServer) {
        config.resolve.alias['react-dev-overlay'] = false;
      }
      return config;
    },
  };
  