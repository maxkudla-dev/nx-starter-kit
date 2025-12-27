import 'reflect-metadata';

import { ApolloServer } from '@apollo/server';
import { startServerAndCreateLambdaHandler } from '@as-integrations/aws-lambda';

import { resolvers } from './graphql/resolvers';
import { typeDefs } from './graphql/schema';

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

export const handler = startServerAndCreateLambdaHandler(
  server,
  {
    context: async () => ({
      getDataSource: async () => {
        throw new Error('Auth data source is not configured.');
      },
    }),
  }
);
