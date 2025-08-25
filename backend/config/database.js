require('dotenv').config();

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: './wiki_dev.db',
    logging: console.log
  },
  production: {
    username: process.env.DB_USER || 'wiki_user',
    password: process.env.DB_PASSWORD || 'wiki_password',
    database: process.env.DB_NAME || 'wiki_db',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
};