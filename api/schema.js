const { gql } = require("apollo-server");

const typedefs = gql`
  enum PositionType {
    GOALKEEPER
    ATTACKER
    MIDFIELDER
    DEFENDER
  }

  union Member = Manager | Player

  type Manager {
    id: ID!
    email: String!
    name: String!
    debutPlayers: [Player]!
  }

  type Player {
    id: ID!
    email: String!
    name: String!
    position: PositionType!
    debut: Int!
    debutManager: Manager
  }

  input ManagerInput {
    email: String
    name: String
  }

  input PlayerInput {
    position: PositionType!
    debut: Int
    manager: ManagerInput
  }

  input NewManagerInput {
    email: String!
    name: String!
  }

  input NewPlayerInput {
    email: String!
    name: String!
    position: PositionType!
    debut: Int
    debutManager: String! # Use the name of the manager as input
  }

  input UpdateManagerInput {
    id: ID
    name: String
    email: String
  }

  input UpdatePlayerInput {
    id: ID!
    name: String
    email: String
    position: PositionType
    debut: Int
    debutManager: String
  }

  type Query {
    managers: [Manager]!
    manager(id: ID!): Manager
    players(input: PlayerInput): [Player]!
    player(id: ID!): Player
    search(name: String): Member
  }

  type Mutation {
    addManager(input: NewManagerInput!): Manager!
    addPlayer(input: NewPlayerInput!): Player!

    updateManager(input: UpdateManagerInput!): Manager!
    updatePlayer(input: UpdatePlayerInput!): Player!

    deletePlayer(id: ID!): ID!
    deleteManager(id: ID!): ID!
  }
`;

module.exports = typedefs;
