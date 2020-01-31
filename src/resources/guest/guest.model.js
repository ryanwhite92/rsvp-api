import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import uid from 'uid-safe';
import config from '../../config';

var guestSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20
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
    password: { type: String, select: false },
    userId: String,
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
  bcrypt.hash(config.GUEST_PASSWORD, 10, (err, hash) => {
    if (err) {
      return next(err);
    }

    this.password = hash;
    next();
  });
});

const normalizeName = name => {
  return name
    .toLowerCase()
    .replace(/(?:^|\s|\-)\S/g, char => char.toUpperCase());
};

guestSchema.pre('save', async function(next) {
  try {
    // store first/last names as lowercase for uniqueness check
    this.firstName = normalizeName(this.firstName);
    this.lastName = normalizeName(this.lastName);
    this.userId = await uid(6);
    next();
  } catch (e) {
    next(e);
  }
});

guestSchema.methods.checkPassword = function(password) {
  const passwordHash = this.password;
  return bcrypt.compare(password, passwordHash);
};

// Create and register guest model on main mongodb connection
export const Guest = mongoose.connection.model('guest', guestSchema);
