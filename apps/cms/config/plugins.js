module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET'),
    },
  },
  // S3-compatible storage (Yandex Object Storage / MinIO)
  upload: {
    config: {
      provider: env('AWS_BUCKET') ? '@strapi/provider-upload-aws-s3' : 'local',
      providerOptions: env('AWS_BUCKET')
        ? {
            baseUrl: env('AWS_ENDPOINT')
              ? `${env('AWS_ENDPOINT')}/${env('AWS_BUCKET')}`
              : `https://storage.yandexcloud.net/${env('AWS_BUCKET')}`,
            s3Options: {
              credentials: {
                accessKeyId: env('AWS_ACCESS_KEY_ID'),
                secretAccessKey: env('AWS_SECRET_ACCESS_KEY'),
              },
              region: env('AWS_REGION', 'ru-central1'),
              endpoint: env('AWS_ENDPOINT', 'https://storage.yandexcloud.net'),
              forcePathStyle: true,
              params: {
                Bucket: env('AWS_BUCKET'),
              },
            },
          }
        : {},
    },
  },
});
