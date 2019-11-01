export const getOne = model => async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await model
      .findById(id)
      .lean()
      .exec();

    if (!doc) {
      return res.status(400).end();
    }

    return res.status(200).json({ data: doc });
  } catch (e) {
    console.error(e);
    return res.status(500).end();
  }
};

export const getMany = model => async (req, res) => {
  try {
    const docs = await model
      .find()
      .lean()
      .exec();

    if (!docs) {
      return res.status(400).end();
    }

    return res.status(200).json({ data: docs });
  } catch (e) {
    console.error(e);
    return res.status(500).end();
  }
};

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

export const crudControllers = model => ({
  getOne: getOne(model),
  getMany: getMany(model),
  createOne: createOne(model)
});
