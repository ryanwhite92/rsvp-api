export const createOne = model => async (req, res) => {
  try {
    const doc = await model.create({ ...req.body });

    if (!doc) {
      return res.status(400).end();
    }

    return res.status(201).json({ data: doc });
  } catch (e) {
    console.error(e);
    return res.status(500).end();
  }
};
