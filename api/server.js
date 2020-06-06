const { ApolloServer, PubSub, ApolloError } = require("apollo-server");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const { models, db } = require("../db");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context({ connection }) {
    console.log("Connection:", connection);
    const context = { models, db };
    return connection ? { ...context, ...connection.context } : context;
  },
  subscriptions: {
    onConnect() {},
    onDisconnect() {},
  },
});

server.listen(8000).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
