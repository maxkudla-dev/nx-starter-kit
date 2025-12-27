import { authResolvers } from '../../../../libs/apollo-auth/src/index';

export const resolvers = {
  ...authResolvers,
  Query: {
    ...authResolvers.Query,
    hello: () => 'Hello from Apollo on Serverless',
  },
};
