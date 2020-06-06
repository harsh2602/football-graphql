const model = require("./db-operations");
const createUsersModel = (db) => model(db, "users");

module.exports = createUsersModel;
