import { Guest } from './guest.model';
import { signin } from '../../utils/auth';
import { crudControllers } from '../../utils/crud';

const updateRsvp = async (req, res) => {
  const { id } = req.params;
  const { rsvpStatus, plusOnes = [] } = req.body;

  try {
    const guest = await Guest.findById(id)
      .lean()
      .exec();

    if (!guest) {
      return res.status(400).end();
    }

    // Update rsvpStatus for existing plusOnes
    // Todo: Add logging if user tries to add additional plusOne(s)
    const updatedPlusOnes = guest.plusOnes.map(guestPlusOne => {
      plusOnes.forEach(plusOne => {
        if (
          guestPlusOne.name == plusOne.name &&
          typeof plusOne.rsvpStatus == 'boolean'
        ) {
          guestPlusOne.rsvpStatus = plusOne.rsvpStatus;
        }
      });
      return guestPlusOne;
    });

    const updatedGuest = await Guest.findByIdAndUpdate(
      id,
      {
        rsvpStatus,
        plusOnes: updatedPlusOnes
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
