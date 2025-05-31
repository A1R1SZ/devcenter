const {Pool} = require("pg");
require("dotenv").config();

const userPool = new Pool({
    user:process.env.DB_USER,
    host:process.env.DB_HOST,
    database:process.env.DB_NAME,
    password:process.env.DB_PASSWORD,
    port:process.env.DB_PORT || 5432,
});

userPool.connect()
    .then(() => console.log("✅ Connected to PostgreSQL"))
    .catch(err => console.log("❌ PostgreSQL Connection Error:", err));

module.exports = userPool;