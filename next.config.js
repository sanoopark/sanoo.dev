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
        source: '/resume',
        destination:
          'https://sanoo.notion.site/9ec1178dd889469eaec619ba3402ecf2',
        permanent: true,
      },
      {
        source: '/study',
        destination:
          'https://sanoo.notion.site/sanoo-dev-835c3d91841e4e74bde822b1d10029ef',
        permanent: true,
      },
      {
        source: '/mashup/1',
        destination:
          'https://sanoo.dev/posts/ComePet-%EB%A6%AC%ED%8C%A9%ED%86%A0%EB%A7%81-%EA%B8%B0%EB%A1%9D-3%ED%8E%B8',
        permanent: true,
      },
      {
        source: '/mashup/2',
        destination:
          'https://sanoo.notion.site/ComePet-c511a87abbab4cceb0eaea9a66f9c53c',
        permanent: true,
      },
    ];
  },
};
