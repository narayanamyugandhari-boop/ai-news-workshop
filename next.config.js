/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Unsplash and placeholder services
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      // News publisher domains
      {
        protocol: 'https',
        hostname: 'techcrunch.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'wired.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'theverge.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'arstechnica.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'venturebeat.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'engadget.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mashable.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'techradar.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'zdnet.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'thenextweb.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cnet.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gizmodo.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lifehacker.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fastcompany.com',
        port: '',
        pathname: '/**',
      },
      // CDN and image hosting services
      {
        protocol: 'https',
        hostname: 'cdn.vox-cdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.arstechnica.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'venturebeat.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
        port: '',
        pathname: '/**',
      },
      // Generic CDN patterns
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
