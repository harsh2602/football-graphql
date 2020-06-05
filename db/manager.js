const model = require("./db-operations");
const createManagerModel = (db) => model(db, "managers");
module.exports = createManagerModel;
