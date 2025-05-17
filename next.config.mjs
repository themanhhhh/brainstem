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
        domains: ['gateway.pinata.cloud'],
    },
    webpack(config, { isServer }) {
      if (!isServer) {
        config.resolve.alias['react-dev-overlay'] = false;
      }
      return config;
    },
    // Add output configuration for standalone build
    output: 'standalone',
  };
  