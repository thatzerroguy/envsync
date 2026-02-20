import { SQL } from "bun";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = new SQL({
  // Connection details (adapter is auto-detected as PostgreSQL)
  url: DATABASE_URL,

  // Alternative connection parameters
  hostname: "localhost",
  port: 5432,
  database: "envsync-dev",
  username: "postgres",
  password: "postgres",

  // Connection pool settings
  max: 20, // Maximum connections in pool
  idleTimeout: 30, // Close idle connections after 30s
  maxLifetime: 0, // Connection lifetime in seconds (0 = forever)
  connectionTimeout: 30, // Timeout when establishing new connections

  // SSL/TLS options
  tls: true,
  // tls: {
  //   rejectUnauthorized: true,
  //   requestCert: true,
  //   ca: "path/to/ca.pem",
  //   key: "path/to/key.pem",
  //   cert: "path/to/cert.pem",
  //   checkServerIdentity(hostname, cert) {
  //     ...
  //   },
  // },

  // Callbacks
  onconnect: client => {
    console.log("Connected to PostgreSQL");
  },
  onclose: client => {
    console.log("PostgreSQL connection closed");
  },
});

export default sql;