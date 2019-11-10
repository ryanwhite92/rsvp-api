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
        type: String,
        rsvpStatus: {
          type: Boolean,
          default: false
        }
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
    }
  },
  { timestamps: true }
);

// Create compound index to prevent the creation of duplicate documents
guestSchema.index({ firstName: 1, lastName: 1 }, { unique: true });

export const Guest = mongoose.model('guest', guestSchema);
