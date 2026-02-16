module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET'),
    },
  },
  // S3-compatible storage (Yandex Object Storage / MinIO)
  upload: {
    config: {
      provider: '@strapi/provider-upload-aws-s3',
      providerOptions: (() => {
        const required = [
          'AWS_BUCKET',
          'AWS_ACCESS_KEY_ID',
          'AWS_SECRET_ACCESS_KEY',
          'AWS_REGION',
          'AWS_ENDPOINT',
        ];
        const missing = required.filter((key) => {
          const value = env(key);
          return typeof value !== 'string' || value.trim().length === 0;
        });

        if (missing.length > 0) {
          throw new Error(
            `[cms] Missing required S3 environment variables: ${missing.join(', ')}. ` +
              'S3-only mode is enabled; define AWS_* vars before starting Strapi.'
          );
        }

        const bucket = env('AWS_BUCKET');
        const endpoint = env('AWS_ENDPOINT');

        return {
          baseUrl: `${endpoint}/${bucket}`,
          s3Options: {
            credentials: {
              accessKeyId: env('AWS_ACCESS_KEY_ID'),
              secretAccessKey: env('AWS_SECRET_ACCESS_KEY'),
            },
            region: env('AWS_REGION'),
            endpoint,
            forcePathStyle: true,
            params: {
              Bucket: bucket,
            },
          },
        };
      })(),
    },
  },
});
