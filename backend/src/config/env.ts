import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
}

export const env = {
  PORT: Number(process.env.PORT) || 5000,

  DB_HOST: required('DB_HOST'),
  DB_PORT: Number(required('DB_PORT')),
  DB_NAME: required('DB_NAME'),
  DB_USER: required('DB_USER'),
  DB_PASSWORD: required('DB_PASSWORD'),

  JWT_SECRET: required('JWT_SECRET'),
};
