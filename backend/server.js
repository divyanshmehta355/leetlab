require('dotenv').config();
const app = require('./src/app');
const { pool } = require('./src/config/db');
const redis = require('./src/config/redis');
const adminRoutes = require('./src/routes/adminRoutes');

const PORT = process.env.PORT || 3000;

// Admin Routes
app.use('/api/admin', adminRoutes);

const startServer = async () => {
  try {
    // Test DB connection
    const client = await pool.connect();
    console.log('Connected to PostgreSQL Database successfully.');
    client.release();

    // Test Redis connection
    await redis.ping();
    console.log('Connected to Redis (Valkey) successfully.');

    // Initialize BullMQ worker
    require('./src/services/worker');
    console.log('BullMQ Worker started.');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
