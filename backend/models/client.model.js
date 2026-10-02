

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const clientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  location: String,
  // Legacy: accounts now authenticate through the User model.
  password: { type: String, select: false },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photographer' }],
}, { timestamps: true });

clientSchema.pre('save', async function () {
  if (!this.password || !this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

clientSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Client', clientSchema);



