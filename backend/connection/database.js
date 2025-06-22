const { Pool } = require("pg");
require("dotenv").config();

let userPool;

if (process.env.DATABASE_URL) {
  // ✅ Running on Render or production
  userPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  // ✅ Running locally on your laptop
  userPool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
  });
}

userPool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch(err => console.error("❌ PostgreSQL Connection Error:", err));

module.exports = userPool;
