import { authTypeDefs } from '../../../../libs/apollo-auth/src/index';

const baseTypeDefs = /* GraphQL */ `
  type Query {
    hello: String!
  }

  type Mutation {
    _noop: Boolean
  }
`;

export const typeDefs = [baseTypeDefs, authTypeDefs];
