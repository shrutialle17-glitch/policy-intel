require('dotenv').config();
const { Client } = require('pg');

const client = new Client({ connectionString: process.env.DIRECT_URL });
async function run() {
  try {
    await client.connect();
    await client.query(`CREATE INDEX IF NOT EXISTS policy_fts_idx ON "Policy" USING GIN (to_tsvector('english', title || ' ' || coalesce(description, '')));`);
    console.log('Index created');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
