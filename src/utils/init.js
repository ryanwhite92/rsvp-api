import { Admin } from '../resources/admin/admin.model';

export const ensureAdminExists = async envVars => {
  try {
    let admin = await Admin.find({})
      .lean()
      .exec();

    if (!admin.length) {
      admin = await Admin.create({
        email: envVars.ADMIN_EMAIL,
        password: envVars.ADMIN_PASSWORD
      });
    }
  } catch (e) {
    console.error(e);
  }
};
