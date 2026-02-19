require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const errorHandler = require('./middleware/errorHandler');

const salesRoutes = require('./routes/salesRoutes');
const itemRoutes  = require('./routes/itemRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/sales', salesRoutes);
app.use('/api/items', itemRoutes);

app.get('/api/health', (req, res) =>
  res.json({ success: true, message: 'Production Management API is running.' })
);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
