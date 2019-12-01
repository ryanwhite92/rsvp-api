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
  });
});
