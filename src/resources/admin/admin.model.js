import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import uid from 'uid-safe';

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
    userId: String,
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

adminSchema.pre('save', async function(next) {
  try {
    this.userId = await uid(6);
    next();
  } catch (e) {
    next(e);
  }
});

adminSchema.methods.checkPassword = function(password) {
  const passwordHash = this.password;
  return bcrypt.compare(password, passwordHash);
};

// Create and register admin model on main mongodb connection
export const Admin = mongoose.connection.model('admin', adminSchema);
