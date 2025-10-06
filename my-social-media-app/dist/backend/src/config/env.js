import dotenv from 'dotenv';
// Load environment variables
dotenv.config();
export const ENV = {
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_USER: process.env.DB_USER || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || 'password',
    DB_NAME: process.env.DB_NAME || 'social_hub',
    DB_PORT: Number(process.env.DB_PORT) || 3306,
};
