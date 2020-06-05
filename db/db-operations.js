const nanoid = require("nanoid");

const createModel = (db, model) => {
  return {
    findOne(filter) {
      return db.get(model).find(filter).value();
    },

    findMany(filter) {
      return db.get(model).filter(filter).value();
    },

    create(filter) {
      const newRecord = { id: nanoid(), ...filter };

      db.get(model).push(newRecord).write();

      return newRecord;
    },

    update(filter) {
      const { id, ...input } = filter;
      db.get(model).find({ id }).assign(input).write();
      return db.get(model).find({ id }).value();
    },

    delete(filter) {
      const { id } = filter;
      db.get(model).remove(filter).write();
      return id;
    },
  };
};

module.exports = createModel;
