const env = process.env.NODE_ENV || 'development';

const baseConfig = {
  env,
  isDev: env === 'development',
  port: 8080,
  dbUrl: 'mongodb://localhost:27017/wedding-api-dev'
};

// Todo: Create different configs for dev, prod & testing environments

export default baseConfig;