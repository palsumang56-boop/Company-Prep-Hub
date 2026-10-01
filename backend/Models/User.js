const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 
const userSchema = new mongoose.Schema({
  emailId: {
    type: String,
    required: [true, 'Please provide an email'], 
    unique: true,
    lowercase: true, 
    match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'], 
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,  
  },
}, {
  timestamps: true,
  // Never send the password hash back in API responses
  toJSON: {
    transform: (doc, ret) => {
      delete ret.password;
      return ret;
    },
  },
});
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.isPasswordCorrect = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
const User = mongoose.model('User', userSchema);
module.exports = User;