import mongoose from 'mongoose';

var guestSchema = new mongoose.Schema(
  {
    name: {
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

export const Guest = mongoose.model('guest', guestSchema);
