import { Guest } from '../guest.model';

describe('guest model', () => {
  describe('schema', () => {
    test('firstName', () => {
      const firstName = Guest.schema.obj.firstName;
      expect(firstName).toEqual({
        type: String,
        required: true,
        trim: true,
        maxlength: 20
      });
    });

    test('lastName', () => {
      const lastName = Guest.schema.obj.lastName;
      expect(lastName).toEqual({
        type: String,
        required: true,
        trim: true,
        maxlength: 20
      });
    });

    test('plusOnes', () => {
      const plusOnes = Guest.schema.obj.plusOnes;
      expect(plusOnes).toEqual([
        {
          name: String,
          rsvpStatus: {
            type: Boolean,
            default: false
          },
          _id: false
        }
      ]);
    });

    test('rsvpStatus', () => {
      const rsvpStatus = Guest.schema.obj.rsvpStatus;
      expect(rsvpStatus).toEqual({
        type: Boolean,
        default: false
      });
    });

    test('contact', () => {
      const contact = Guest.schema.obj.contact;
      expect(contact).toEqual({
        method: {
          type: String,
          required: true,
          enum: ['email', 'phone']
        },
        phone: String,
        email: String
      });
    });

    test('password', () => {
      const password = Guest.schema.obj.password;
      expect(password).toBe(String);
    });

    test('userId', () => {
      const userId = Guest.schema.obj.userId;
      expect(userId).toBe(String);
    });

    test('role', () => {
      const role = Guest.schema.obj.role;
      expect(role).toEqual({
        type: String,
        default: 'guest',
        enum: ['guest']
      });
    });
  });
});
