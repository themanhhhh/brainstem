export default {
    reactStrictMode: true,
    devIndicators: {
      buildActivity: false,
    },
    images: {
      domains: ['gateway.pinata.cloud'],
    },
    webpack(config, { isServer }) {
      if (!isServer) {
        config.resolve.alias['react-dev-overlay'] = false;
      }
      return config;
    },
  };
  