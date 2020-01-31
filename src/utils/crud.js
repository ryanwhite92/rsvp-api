const getModelSelectFields = model => {
  let selectFields;
  if (model.modelName == 'guest') {
    selectFields = 'firstName lastName rsvpStatus plusOnes role userId';
  }
  if (model.modelName == 'admin') {
    selectFields = 'email role userId';
  }
  return selectFields;
};

export const getOne = model => async (req, res) => {
  const { id } = req.params;
  const selectFields = getModelSelectFields(model);

  try {
    const doc = await model
      .findOne({ userId: id })
      .select(selectFields)
      .lean()
      .exec();

    if (!doc) {
      return res.status(404).end();
    }

    return res.status(200).json({ data: doc });
  } catch (e) {
    console.error(e);
    return res.status(500).end();
  }
};

export const getMany = model => async (req, res) => {
  const selectFields = getModelSelectFields(model);

  try {
    const docs = await model
      .find({})
      .select(selectFields)
      .lean()
      .exec();

    if (!docs.length) {
      return res.status(404).end();
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

    const returnDoc = doc.toObject();
    delete returnDoc.password;

    return res.status(201).json({ data: returnDoc });
  } catch (e) {
    console.error(e);
    return res.status(500).end();
  }
};

export const updateOne = model => async (req, res) => {
  const { id } = req.params;

  try {
    const updatedDoc = await model
      .findOneAndUpdate(
        { userId: id },
        { ...req.body },
        { new: true, fields: '-password' }
      )
      .lean()
      .exec();

    if (!updatedDoc) {
      return res.status(404).end();
    }

    return res.status(200).json({ data: updatedDoc });
  } catch (e) {
    console.error(e);
    return res.status(500).end();
  }
};

export const removeOne = model => async (req, res) => {
  const { id } = req.params;

  try {
    const removedDoc = await model
      .findOneAndDelete({ userId: id })
      .select('-password')
      .lean()
      .exec();

    if (!removedDoc) {
      return res.status(404).end();
    }

    return res.status(200).json({ data: removedDoc });
  } catch (e) {
    console.error(e);
    return res.status(500).end();
  }
};

export const crudControllers = model => ({
  getOne: getOne(model),
  getMany: getMany(model),
  createOne: createOne(model),
  updateOne: updateOne(model),
  removeOne: removeOne(model)
});
