const { ApolloServer, AuthenticationError } = require("apollo-server");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const { models, db } = require("../db");
const { createToken, getUserFromToken } = require("./auth");
const { FormatDateDirective } = require("./directives");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives: {
    formatDate: FormatDateDirective,
  },
  context({ req, connection }) {
    const context = { models, db };
    if (connection) return { ...context, ...connection.context };

    const token = req.headers.authorization;
    const user = getUserFromToken(token);
    return { ...context, user, createToken };
  },
  subscriptions: {
    onConnect(params) {
      const token = params.authorization;
      const user = getUserFromToken(token);

      if (!user) {
        throw new AuthenticationError("Not Authenticated to subscribe");
      }
      return { user };
    },
  },
});

server.listen(8000).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
