import { authResolvers } from "@nx-apollo-auth-library";

export const resolvers = {
  ...authResolvers,
  Query: {
    ...authResolvers.Query,
    hello: () => 'Hello from Apollo on Serverless',
  },
};
