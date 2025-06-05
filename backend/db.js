const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pc_builder',
  password: 'kobolchin11',
  port: 5432,
});

module.exports = pool;
