const model = require('./db-operations');
const createPlayerModel = (db) => model(db, "players");

module.exports = createPlayerModel;
