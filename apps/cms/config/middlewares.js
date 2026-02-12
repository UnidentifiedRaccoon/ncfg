module.exports = [
  'strapi::logger',
  'strapi::errors',
  // Compression middleware - required for YC Serverless (3.5MB response limit)
  {
    name: 'strapi::compression',
    config: {
      br: false, // Disable brotli (slower)
    },
  },
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: [
        'http://localhost:3000',
        'http://localhost:1337',
        // Yandex Cloud Serverless Containers
        /\.containers\.yandexcloud\.net$/,
        // CMS gateway domain
        'https://admin.ncfg.ru',
        // Production domains (add when ready)
        // 'https://ncfg.ru',
        // 'https://www.ncfg.ru',
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      keepHeaderOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
