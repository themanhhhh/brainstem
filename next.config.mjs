export default {
    reactStrictMode: true,
    devIndicators: {
      buildActivity: false,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'gateway.pinata.cloud',
                port: '',
                pathname: '/ipfs/**',
            },
        ],
        unoptimized: true,
    },
    webpack(config, { isServer }) {
      if (!isServer) {
        config.resolve.alias['react-dev-overlay'] = false;
      }
      return config;
    },
  };
  