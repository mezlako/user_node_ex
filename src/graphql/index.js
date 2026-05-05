const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express4');
const { GraphQLError } = require('graphql');
const config = require('../config/config');
const ApiError = require('../utils/ApiError');
const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');
const { createContext } = require('./context');

let registered;

const formatGraphQLError = (formattedError, error) => {
  const original = error.originalError;
  if (original instanceof ApiError) {
    return {
      message: original.message,
      locations: formattedError.locations,
      path: formattedError.path,
      extensions: {
        ...formattedError.extensions,
        code: `HTTP_${original.statusCode}`,
        httpStatus: original.statusCode,
      },
    };
  }
  if (original instanceof GraphQLError && original.extensions && original.extensions.code === 'UNAUTHENTICATED') {
    return formattedError;
  }
  return formattedError;
};

/**
 * Mount Apollo Server at /graphql (call once).
 * @param {import('express').Application} app
 */
const registerGraphQL = async (app) => {
  if (registered) {
    return;
  }

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: config.env !== 'production',
    formatError: formatGraphQLError,
  });

  await apolloServer.start();

  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: createContext,
    })
  );

  registered = true;
};

module.exports = {
  registerGraphQL,
};
