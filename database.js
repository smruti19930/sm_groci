const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.fmlhxxdtihjtcqpttocj:Smruti1234@aws-0-ap-south-1.pooler.supabase.com:6543/postgres',
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
