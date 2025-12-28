import 'reflect-metadata';

import { ApolloServer } from '@apollo/server';
import { startServerAndCreateLambdaHandler } from '@as-integrations/aws-lambda';

import { getDataSource } from './data-source';
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
      getDataSource,
    }),
  }
);
