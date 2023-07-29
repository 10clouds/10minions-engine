import * as dotenv from 'dotenv';
// see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
dotenv.config({ path: `.env.local`, override: true });

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
