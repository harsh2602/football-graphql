const { PubSub, UserInputError } = require("apollo-server");

const NEW_SIGNING = "NEW_SIGNING";
const pubSub = new PubSub();

module.exports = {
  Query: {
    managers(_, __, { models }) {
      return models.Managers.findMany({});
    },
    manager(_, { id }, { models }) {
      return models.Managers.findOne({ id });
    },
    players(_, { input }, { models }) {
      return models.Players.findMany(input || {});
    },
    player(_, { id }, { models }) {
      return models.Players.findOne({ id });
    },
    search(_, { name }, { models }) {
      const manager = models.Managers.findOne({ name });
      const player = models.Players.findOne({ name });
      return manager && player ? { ...manager, ...player } : manager || player;
    },
  },
  Mutation: {
    addManager(_, { input }, { models }) {
      if (models.Managers.findOne({ name: input.name }))
        throw new UserInputError("Manager could not be created");
      return models.Managers.create({ ...input });
    },
    addPlayer(_, { input }, { models }) {
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
    },

    updateManager(_, { input }, { models }) {
      return models.Managers.update(input);
    },

    updatePlayer(_, { input }, { models }) {
      const { debutManager } = input;
      if (debutManager) {
        const { id } = models.Managers.findOne({ name: debutManager });
        delete input.debutManager;
        input.reportsTo = id;
      }
      return models.Players.update(input);
    },
    deleteManager(_, { id }, { models }) {
      return models.Managers.delete({ id });
    },

    deletePlayer(_, { id }, { models }) {
      return models.Players.delete({ id });
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
