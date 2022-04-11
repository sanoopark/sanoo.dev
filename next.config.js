module.exports = {
  images: {
    domains: ['user-images.githubusercontent.com'],
  },
  async redirects() {
    return [
      {
        source: '/github',
        destination: 'https://github.com/sanoopark',
        permanent: true,
      },
      {
        source: '/study',
        destination:
          'https://sanoo.notion.site/sanoo-dev-835c3d91841e4e74bde822b1d10029ef',
        permanent: true,
      },
    ];
  },
};
