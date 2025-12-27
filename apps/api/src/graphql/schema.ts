import { authTypeDefs } from '@nx-apollo-auth-library';

const baseTypeDefs = /* GraphQL */ `
  type Query {
    hello: String!
  }

  type Mutation {
    _noop: Boolean
  }
`;

export const typeDefs = [baseTypeDefs, authTypeDefs];
