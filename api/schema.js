const { gql } = require("apollo-server");

const typedefs = gql`
  directive @formatDate(format: String = "dd MMM yyyy") on FIELD_DEFINITION
  directive @authenticate on FIELD_DEFINITION

  enum PositionType {
    GOALKEEPER
    ATTACKER
    MIDFIELDER
    DEFENDER
  }

  union Member = Manager | Player

  enum Role {
    ADMIN
    MEMBER
  }

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

  type User {
    id: ID!
    email: String!
    role: Role!
    createdAt: String @formatDate
  }

  type AuthUser {
    token: String!
    user: User!
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

  input SignupInput {
    email: String!
    password: String!
    role: Role!
  }

  input SigninInput {
    email: String!
    password: String!
  }

  type Query {
    me: User! @authenticate
    managers: [Manager]!
    manager(id: ID!): Manager
    players(input: PlayerInput): [Player]!
    player(id: ID!): Player
    search(name: String): Member
  }

  type Mutation {
    addManager(input: NewManagerInput!): Manager!
    """
    Pass the manager name for debutManager
    """
    addPlayer(input: NewPlayerInput!): Player!

    updateManager(input: UpdateManagerInput!): Manager!
    updatePlayer(input: UpdatePlayerInput!): Player!

    deletePlayer(id: ID!): ID!
    deleteManager(id: ID!): ID!

    signup(input: SignupInput!): AuthUser!
    signin(input: SigninInput!): AuthUser!
  }

  type Subscription {
    newSigning: Player!
  }
`;

module.exports = typedefs;
