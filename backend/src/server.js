require('dotenv').config();

const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 32 || secret === 'change_me') {
  console.error('JWT_SECRET is missing or too weak. Set a long random value in .env');
  process.exit(1);
}

const app = require('./app');
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
