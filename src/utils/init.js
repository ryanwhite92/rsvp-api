import config from '../config';
import { Admin } from '../resources/admin/admin.model';

export const ensureAdminExists = async envVars => {
  try {
    let admin = await Admin.find({})
      .lean()
      .exec();

    if (!admin.length) {
      admin = await Admin.create({
        email: config.ADMIN_EMAIL,
        password: config.ADMIN_PASSWORD
      });
    }
  } catch (e) {
    console.error(e);
  }
};
