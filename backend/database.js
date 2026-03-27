const mysql = require('mysql2');

// MySQL connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'mysql-db',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'student_user',
  password: process.env.DB_PASSWORD || 'student_password',
  database: process.env.DB_NAME || 'student_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Create promisified version for async/await
const promisePool = pool.promise();

// Test database connection
async function testConnection() {
  try {
    const connection = await promisePool.getConnection();
    console.log('Connected to MySQL database successfully');
    console.log('Database Config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database
    });
    connection.release();
    return true;
  } catch (error) {
    console.error('Error connecting to MySQL database:', error.message);
    return false;
  }
}

// Create students table if it doesn't exist
async function initDatabase() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      age INT NOT NULL,
      father_name VARCHAR(255) NOT NULL,
      aadhaar_number VARCHAR(12) UNIQUE NOT NULL,
      class VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;

  try {
    await promisePool.execute(createTableSQL);
    console.log('Students table is ready');
    return true;
  } catch (error) {
    console.error('Error creating students table:', error.message);
    return false;
  }
}

// Initialize database with retry logic
async function initDatabaseWithRetry(maxRetries = 5, delay = 5000) {
  for (let i = 0; i < maxRetries; i++) {
    const connected = await testConnection();
    if (connected) {
      const initialized = await initDatabase();
      if (initialized) {
        return true;
      }
    }

    if (i < maxRetries - 1) {
      console.log(`Database connection failed. Retrying in ${delay/1000} seconds... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  console.error('Failed to initialize database after', maxRetries, 'attempts');
  return false;
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Closing MySQL connection pool...');
  pool.end(() => {
    console.log('MySQL connection pool closed.');
    process.exit(0);
  });
});

module.exports = {
  pool,
  promisePool,
  initDatabase: initDatabaseWithRetry,
  testConnection
};