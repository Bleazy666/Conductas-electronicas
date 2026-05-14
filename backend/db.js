import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "conduct_log",
  password: "TU_PASSWORD",
  port: 5432,
});

export default pool;