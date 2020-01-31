import { Admin } from '../admin.model';

describe('admin model', () => {
  describe('schema', () => {
    test('email', () => {
      const email = Admin.schema.obj.email;
      expect(email).toEqual({
        type: String,
        required: true,
        unique: true,
        trim: true
      });
    });

    test('password', () => {
      const password = Admin.schema.obj.password;
      expect(password).toEqual({
        type: String,
        required: true,
        select: false
      });
    });

    test('userId', () => {
      const userId = Admin.schema.obj.userId;
      expect(userId).toBe(String);
    });

    test('role', () => {
      const role = Admin.schema.obj.role;
      expect(role).toEqual({
        type: String,
        default: 'admin',
        enum: ['admin']
      });
    });
  });
});
