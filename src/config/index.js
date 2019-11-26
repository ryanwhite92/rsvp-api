import dotenv from './env';

const envVars = dotenv.parsed;
const ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 8080;

const baseConfig = {
  ...envVars,
  ENV,
  PORT
};

export default baseConfig;
