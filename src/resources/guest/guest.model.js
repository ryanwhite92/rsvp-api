import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from '../../config';

var guestSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    plusOnes: [
      {
        name: String,
        rsvpStatus: {
          type: Boolean,
          default: false
        },
        _id: false
      }
    ],
    rsvpStatus: {
      type: Boolean,
      default: false
    },
    contact: {
      method: {
        type: String,
        required: true,
        enum: ['email', 'phone']
      },
      phone: String,
      email: String
    },
    password: String,
    role: {
      type: String,
      default: 'guest',
      enum: ['guest']
    }
  },
  { timestamps: true }
);

// Create compound index to prevent the creation of duplicate documents
guestSchema.index({ firstName: 1, lastName: 1 }, { unique: true });

guestSchema.pre('save', function(next) {
  bcrypt.hash(config.envVars.GUEST_PASSWORD, 10, (err, hash) => {
    if (err) {
      return next(err);
    }

    this.password = hash;
    next();
  });
});

guestSchema.methods.checkPassword = function(password) {
  const passwordHash = this.password;
  return bcrypt.compare(password, passwordHash);
};

export const Guest = mongoose.model('guest', guestSchema);
