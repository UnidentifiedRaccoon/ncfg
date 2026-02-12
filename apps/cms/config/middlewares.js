const parseHost = (value) => {
  if (!value) return null;

  try {
    return new URL(value).host;
  } catch {
    return value.replace(/^https?:\/\//, '').split('/')[0] || null;
  }
};

const extraMediaSources = (process.env.CSP_MEDIA_SRC || '')
  .split(',')
  .map((source) => source.trim())
  .filter(Boolean);

const mediaSources = [
  'market-assets.strapi.io',
  'res.cloudinary.com',
  'storage.yandexcloud.net',
  '*.storage.yandexcloud.net',
  parseHost(process.env.AWS_ENDPOINT),
  ...extraMediaSources,
].filter(Boolean);

const mediaSourcesUnique = [...new Set(mediaSources)];

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
          'img-src': ["'self'", 'data:', 'blob:', ...mediaSourcesUnique],
          'media-src': ["'self'", 'data:', 'blob:', ...mediaSourcesUnique],
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
