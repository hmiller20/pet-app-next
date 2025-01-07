import type { NextConfig } from 'next';
import type { Configuration as WebpackConfig } from 'webpack';

const nextConfig: NextConfig = {
  images: {
    domains: [], // Add any required image domains here
    remotePatterns: [] // Add any required remote patterns here
  },

  // Disable x-powered-by header
  poweredByHeader: false,

  webpack: (
    config: WebpackConfig,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ): WebpackConfig => {
    // Add JSON handling
    config.module?.rules?.push({
      test: /\.json$/,
      type: 'json'
    });

    // Increase chunk loading timeout
    config.watchOptions = {
      aggregateTimeout: 300,
      poll: 1000,
    };

    // Optimize production builds
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },

  // Environment configuration
  env: {
    // Add any environment variables here
  },

  // Experimental features
  experimental: {
    // Add any experimental features here
  },

  // Headers configuration
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};

export default nextConfig;