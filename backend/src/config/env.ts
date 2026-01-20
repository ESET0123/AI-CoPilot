import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value.trim();
}

export const env = {
  PORT: Number(process.env.PORT) || 5000,

  DB_HOST: required('DB_HOST'),
  DB_PORT: Number(required('DB_PORT')),
  DB_NAME: required('DB_NAME'),
  DB_USER: required('DB_USER'),
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  COOKIE_ENCRYPTION_KEY: required('COOKIE_ENCRYPTION_KEY'),

  JWT_SECRET: required('JWT_SECRET'),

  AI_SERVICE_URL: (process.env.AI_SERVICE_URL || 'http://localhost:8001').trim(),
  KEYCLOAK_CLIENT_SECRET: required('KEYCLOAK_CLIENT_SECRET'),
  KEYCLOAK_URL: (process.env.KEYCLOAK_URL || 'http://localhost:8080').trim(),
  KEYCLOAK_REALM: (process.env.KEYCLOAK_REALM || 'my_realm').trim(),
  KEYCLOAK_CLIENT_ID: (process.env.KEYCLOAK_CLIENT_ID || 'my_client').trim(),
  FRONTEND_URL: (process.env.FRONTEND_URL || 'http://localhost:5173').trim(),
  NODE_ENV: (process.env.NODE_ENV || 'development').trim(),
};
