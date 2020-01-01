import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: 'admin',
      enum: ['admin']
    }
  },
  { timestamps: true }
);

adminSchema.pre('save', function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) {
      return next(err);
    }
    this.password = hash;
    next();
  });
});

adminSchema.methods.checkPassword = function(password) {
  const passwordHash = this.password;
  return bcrypt.compare(password, passwordHash);
};

// export const Admin = mongoose.model('admin', adminSchema);
export const Admin = mongoose.connection.model('admin', adminSchema);
