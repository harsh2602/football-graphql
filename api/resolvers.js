const {
  PubSub,
  UserInputError,
  AuthenticationError,
} = require("apollo-server");
const { authenticate, authorize } = require("./auth");
const NEW_SIGNING = "NEW_SIGNING";
const pubSub = new PubSub();

const ADMIN = "ADMIN";

module.exports = {
  Query: {
    me: authenticate((_, __, { user }) => {
      return user;
    }),
    managers: authenticate((_, __, { models }) => {
      return models.Managers.findMany({});
    }),
    manager: authenticate((_, { id }, { models }) => {
      return models.Managers.findOne({ id });
    }),
    players: authenticate((_, { input }, { models }) => {
      return models.Players.findMany(input || {});
    }),
    player: authenticate((_, { id }, { models }) => {
      return models.Players.findOne({ id });
    }),
    search: authenticate((_, { name }, { models }) => {
      const manager = models.Managers.findOne({ name });
      const player = models.Players.findOne({ name });
      return manager && player ? { ...manager, ...player } : manager || player;
    }),
  },
  Mutation: {
    addManager: authenticate(
      authorize(ADMIN, (_, { input }, { models }) => {
        if (models.Managers.findOne({ name: input.name }))
          throw new UserInputError("Manager could not be created");
        return models.Managers.create({ ...input });
      })
    ),
    addPlayer: authenticate(
      authorize(ADMIN, (_, { input }, { models }) => {
        if (models.Players.findOne({ name: input.name }))
          throw new UserInputError("Player could not be created");
        let { debutManager, debut } = input;
        const { id } = models.Managers.findOne({ name: debutManager }) || {};
        if (id === undefined) {
          throw new UserInputError(
            "We could not find the right information to set this player up. Please check and try again."
          );
        }

        if (!debut) {
          input.debut = new Date().getFullYear();
        }

        delete input.debutManager;
        input.reportsTo = id;

        const player = models.Players.create({ ...input });
        pubSub.publish(NEW_SIGNING, { newSigning: player });
        return player;
      })
    ),

    updateManager: authenticate(
      authorize(ADMIN, (_, { input }, { models }) => {
        return models.Managers.update(input);
      })
    ),

    updatePlayer: authenticate(
      authorize(ADMIN, (_, { input }, { models }) => {
        const { debutManager } = input;
        if (debutManager) {
          const { id } = models.Managers.findOne({ name: debutManager });
          delete input.debutManager;
          input.reportsTo = id;
        }
        return models.Players.update(input);
      })
    ),
    deleteManager: authenticate(
      authorize(ADMIN, (_, { id }, { models }) => {
        return models.Managers.delete({ id });
      })
    ),

    deletePlayer: authenticate(
      authorize(ADMIN, (_, { id }, { models }) => {
        return models.Players.delete({ id });
      })
    ),
    signup(_, { input }, { models, createToken }) {
      const existing = models.Users.findOne({ email: input.email });

      if (existing) {
        throw new AuthenticationError("Invalid User Credentials");
      }

      const user = models.Users.create({ ...input, createdAt: Date.now() });
      const token = createToken(user);
      return { token, user };
    },
    signin(_, { input }, { models, createToken }) {
      const user = models.Users.findOne(input);

      if (!user) {
        throw new AuthenticationError("Invalid Password and Email Combination");
      }

      const token = createToken(user);
      return { token, user };
    },
  },
  Subscription: {
    newSigning: {
      subscribe: () => pubSub.asyncIterator(NEW_SIGNING),
    },
  },
  Manager: {
    debutPlayers(manager, _, { models }) {
      return models.Players.findMany({ reportsTo: manager.id });
    },
  },
  Player: {
    debutManager(player, _, { models }) {
      return models.Managers.findOne({ id: player.reportsTo });
    },
  },
  Member: {
    __resolveType(member) {
      return member.debut ? "Player" : "Manager";
    },
  },
};
