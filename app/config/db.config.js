const {
  NODE_ENV,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_NAME,
} = process.env;

module.exports = {
  url: NODE_ENV === 'local' ? `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}` : `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`
};