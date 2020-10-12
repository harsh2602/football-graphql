## WHAT IS GRAPHQL?

[GraphQL](https://graphql.org/) is a [spec](https://graphql.github.io/graphql-spec/) that describes a declarative query language that your client can use to ask an API for the exact data they want during runtime. GraphQL provides a complete and understandable description of the data in your API, gives clients the power to ask for exactly what they need and nothing more, makes it easier to evolve APIs over time, and enables powerful developer tools.

This is achieved by creating a strongly typed Schema for your API, ultimate flexibility in how your API can resolve data, and client queries validated against your Schema.

#### Key Features:

- Ask for what you need, get exactly that
- Get many resources in a single request
- Describe what’s possible with a type system
- Evolve your API without versions
- Bring your own data and code

It can be used both on the server side and the client side.

### Server Side:

1. Type Definitions
2. Resolvers
3. Query Definitions
4. Mutation Definitions
5. Composition
6. Schema

### Schemas

A schema is like a contract that defines how your data will look like. Once you create a graphQL server you would need to create a schema. It is where you define type defintions using a `Schema Definition Language (SDL)`. Everything you want to do in graphql goes through your schema.

Parts of Schema:

1. Types
2. Fields
3. Scalars: String, ID, Boolean, Int, Float
4. Query
5. Mutations

#### Note: ID represents a unique identifier which is serialized the same way as a String. However the intent is to not make it human readable.

We will be using the GraphQL apollo server implementation. It is one of the popular implentations and is widely used.

Let's declare a schema with a type, query and resolver. This is the basic stuff you need for a server to be useful:

```
const gql = require('graphql-tag)
const { ApolloServer } = require('apollo-server')

const typeDefs = gql`
  type User {
    email: String! # Signifies Not Null
    name: String
    friends: [User]!
  }

  type Query {
    me: User!
  }
`

const resolver = {
  Query: {
    me() {
      return {
        email: 'example@eg.com',
        name: 'Example User',
        friends: []
      }
    }
  }
}

const server = new ApolloServer({
  typeDefs, // (*)
  resolvers
})

server.listen(4000)
  .then(() => console.log('listening on port 4000'));
```

If you have multiple typedefs in separate files, line (\*) can be an array of type defintions.

As you can see, we defined a type `User`, added a `me` query that returns the a type User and set a resolver for the **_me_** query type to say what object it is going to return. This is just the bare minimum a server needs to be useful as a graphql server.

In a nutshell:

```
Schema + Resolvers => Server
```

#### Typedef

Typedef is whatever type is defined in the schema. `User + Query` in above code.

#### Query

Query is a special `type` on a schema that defines operations clients can perform to access data that resembles the shape of other types in the Schema.

In the above code the query type having a `me` query which returns the shape of type User. You could similarly return scalars here.

#### Resolvers

Resolvers(more details below) are functions that are responsible for returning values for fields that exist on Types in Schema. It's execution depends on the incoming client query.

In the above code, we are resolving the `me` query which in turn returns the object as is expected by the query.

- Resolver name has to match the name in the type (`me` in Query Type).
- Resolver must return the value type declared for the matching field (me returns a type `User` in the Query)

You could also write a resolver for each single field on a type as well. Unless asked, the resolvers won't even run for a particular field. This is actually the graph nature in graphql.

##### Some important points to note:

1. GraphQL only has one endpoint most of the time is `POST`(though you could do things over `GET` too).

2. It does not respect HTTP. There is no error response. Hence every response is a status code 200 in graphql. You probably need to use the response message to decide whether the request was success or a failure response.

3. Resolvers can be async, you can retrieve data from any source. Graphql won't care

### Resolvers

Resolvers were introduced eariler. Below content highlight's a bit more of the inner workings of resolvers.

Q. As already mentioned, we can have field level resolvers as well in a type. How does graphql achieve that?

A. By default GraphQL will look at the return object from a top level resolver and it will match the keys in that object with the fields in that object and it's return type one-to-one. So by default, it creates a resolver for every single field. This is called the `default resolver` and all it does is look for a key with the same name and resolves that field. That's how you can query an entire object for e.g. `User` but only return the `email` field on that.

Even in the network tab, you will only see the field you asked for even though the resolver returned the entire object.

#### NOTE

An individual field level resolver will override whatever result was returned from the default resolver.

#### Arguments on a resolver

A resolver can have 4 arguments.:

```
type Pet {
  id: ID!
  name: String!
  img: String!
}

type Query {
  pets: [Pet]!
}

const resolver = {
  Query: {
    pets(_, {query}, {context}) {
      // returns array of pets
    }
  }
}
```

1. `initialValue`: Since pets is resolver for top level, the first argument is undefined. If you were resolving for a field e.g. `id` under type Pet, since Pet is resolved first the initialvalue would be a pet.

2. `argument`: An object with arguments to run your query against e.g. a particular type of pet. Will be `undefined` if nothing is passed. Note that these have be defined in the schema and cannot be any arbitrary value.

3. `context object`: This is third argument in the server object. Whatever extra information you want to pass can be passed in the context object:

```
const server = new ApolloServer({
  typeDefs, // (*)
  resolvers,
  context() {
    // return the extra information e.g. user info, models, db instance etc.
  }
})

//We will see an example later for 2 and 3
```

4. `info`: This argument contains the `abstract syntax tree` info which can be used for projections. Really advanced. Not going to use them most times.

### Arguments

Arguments allow clients to pass variables along with our queries to the resolvers. It would be the second argument in the resolver.

```
type Pet {
  id: ID!
  name: String!
  img: String!
}

type Query {
  pet(id: ID!): Pet! # (*)
}

// In the resolver

pet(_, {id}) {
  return models.Pet.findOne({id})
}

// 'id' is passed from the pet query in line (*); name has to match

// NOTE: comments in schema start with #
```

- Arguments cannot be any arbitrary values. It has to be validated from the schema.

- They can be added to any fields and not only queries

e.g. in the above type Pet:

```
type Pet {
  id: ID!
  name: String!
  type: String!
  img(height: String, width: String): String!
}
```

The height and width arguments can be used to get an image speciific to the device on which the client wants to render. Another way to do that is with `directives`.

- They have to be `Scalars` or `InputTypes`.

### Input Type

Input Types are just like types but used for Arguments. All the fields on the input types eventually have to resolve to a scalar but they can be other input types.

```
input PetInput {
  name: String
  type: String
}

type Query {
  pets(input: PetInput): [Pet]!
}

// In the resolver
pets(_, {input}) { / (*)
  // resolve for pets using input.name and input.type
}
```

In line (\*) input is an object that contains a name and a type.

- You cannot extend a type to an input type.

```
input PetInput {
  name: String
  type: String
  ...Pet.fields # not allowed
}
```

This is because GraphQL internals treat the AST for input types differently than the internals for type.

On the client side:

```
{
  pets(input: { type: "DOG", name: "Nathan"}) {
  id
  type
  name
  }
}
```

## Mutations

Just like Queries are used to read data from the server, you could use mutations to create or update data on the server. It is essentially used to perform the create, update and delete operations. Mutations can also accept arguments like queries.

Mutation (like Query) is also a special type in GraphQL Schema.

```
input NewPetInput {
  name: String!
  type: String!
}

type Mutation {
  addPet(input: NewPetInput!): Pet!
}
```

Aove code means that create a new pet of type `Pet` by passing an input of type `NewPetInput` with non-null `name` and `type` fields.

A resolver would look like:

```
Mutation: {
    addPet(_, {input}, {models, user}) {
      // Create a Pet and return it
    }
  },
```

#### NOTE: It is always a good practice to return some kind of value from the Mutation to take advantage of the client side caching which a lot of graphql implementations provide on the client side. This would in turn avoid making another query to the server for the data after the mutation is performed.

On the client side:

```
addPet(input: {type: "DOG", name: "Rudy"}) {
  id
  type
  name
}
```

### Enums

Like any other language(e.g. Typescript or Java), enums in graphql also allow you to declare enums to restrict a field to a particular value.

```
enum PetType {
  CAT
  DOG
}

type Pet {
  id: ID
  type: PetType! # Pet can be of type DOG or CAT
  name: String
}

input NewPetInput {
  name: String!
  type: PetType! # Can use the PetType in the query and mutation as well
}
```

On the client side:

```
{
  pets(input: { type: DOG, name: "Nathan"}) { # enum will resolve to string by default
  id
  type
  name
  }
}
```

## Relationships

Realtionships is basically the `graph in graphql`. Relationship is when we don't have a relationship between two fields in our database but want to virtualize it as a realtionship in graphql schema. E.g., in a pet app, how to link Pet to a User and and User to Pets i.e. two complex types to each other. This is where the design decision on querying comes into picture as a client can send huge queries with large depth trying to DDos the graphql server.

In traditional REST API, the api is a predefined list of operations that always return the same shapes. In graphql api, we have a set of nodes that know how to resolve themselves and have links to other nodes. This enables the client to ask for nodes and use links to follow towards other nodes.

#### Adding a relationship

We will add field resolvers for relationships.

```
type User {
  id: ID!
  username: String!
  pets: [Pet]!
}

type Pet {
  id: ID!
  type: PetType!
  name: String
  owner: User ## no direct field in datasource so graphql cannot resolve
}

// So now Pet has a field owner which resolves to User which has a field pets which is an array of Pet

// In our field level resolvers:

Pet: {
    owner(pet, _, {models}) { // *
      return models.User.findOne({id: pet.user})
    }
  }
User: {
    pets(user, _, {models}) {// **
      return models.Pet.findMany({user: user.id})
    }
  }
```

For lines \* and \*\*, we have a first argument which is the value that is returned once we resolve and return the top level resolver which in this case will be in the `Query resolvers` for User and Pet.

The client can issue a request like:

```
{
  user{
    pets{
      owner{
        username
        pets {
          owner {
            id
            pets{
              name
              -------
              -------
            }
          }
        }
      }
    }
  }
}
```

#### NOTE: This can go on for few more depths before we DDoS the server. And since graphql is just one request, a CDN cannot help in request caching. There are libraries which can help out in request limiting by restricting the depth you can go to fetch information. Design depends based on what works the individual application.

- Remember, field level resolvers run in parallel, so at no point depend on one resolver value to resolve another resolver.
