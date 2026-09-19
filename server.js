require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const orderRoutes = require('./routes/orderRoutes');
const scriptRoutes = require('./routes/scriptRoutes');
const creatorRoutes = require('./routes/creatorRoutes');
const shootRoutes = require('./routes/shootRoutes');
const videoRoutes = require('./routes/videoRoutes');
const financeRoutes = require('./routes/financeRoutes');
const clientPortalRoutes = require('./routes/clientPortalRoutes');
const healthRoutes = require('./routes/healthRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/scripts', scriptRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/api/shoots', shootRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/client-portal', clientPortalRoutes);

app.use('/api/health', healthRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Leadyfy OS API listening on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
