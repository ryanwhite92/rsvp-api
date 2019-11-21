import { Guest } from './guest.model';
import { signin } from '../../utils/auth';
import { crudControllers } from '../../utils/crud';

const updateRsvp = async (req, res) => {
  const { id } = req.params;
  const { rsvpStatus } = req.body;

  try {
    // Update guest if successful
    const updatedGuest = await Guest.findByIdAndUpdate(
      id,
      {
        rsvpStatus,
        plusOnes
      },
      { new: true }
    )
      .lean()
      .exec();

    return res.status(200).json({ data: updatedGuest });
  } catch (e) {
    console.error(e);
    return res.status(500).end();
  }
};

export default {
  ...crudControllers(Guest),
  signin: signin(Guest),
  updateRsvp
};
