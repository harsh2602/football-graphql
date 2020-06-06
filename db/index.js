const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db/db.json");
const db = low(adapter);

const createManagerModel = require("./manager");
const createPlayerModel = require("./player");
const createUserModel = require("./users");

db.defaults({ users: [], managers: [], players: [] });

module.exports = {
  models: {
    Managers: createManagerModel(db),
    Players: createPlayerModel(db),
    Users: createUserModel(db),
  },
  db,
};
