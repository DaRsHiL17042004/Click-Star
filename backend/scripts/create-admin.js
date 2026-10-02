// Usage: npm run create-admin -- "Full Name" admin@example.com "a-strong-password"
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const { hashPassword } = require('../services/auth.service');

(async () => {
  const [name, email, password] = process.argv.slice(2);
  if (!name || !email || !password || password.length < 8) {
    console.error('Usage: npm run create-admin -- "Full Name" email password(8+ chars)');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { name, email: email.toLowerCase(), password: await hashPassword(password), role: 'admin' },
    { upsert: true, new: true }
  );
  console.log(`Admin ready: ${user.email}`);
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
