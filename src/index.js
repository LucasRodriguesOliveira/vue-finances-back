const { GraphQLServer } = require('graphql-yoga');
const Binding = require('prisma-binding');
const { prisma } = require('./generated/prisma-client');

const resolvers = require('./resolvers');

const server = new GraphQLServer({
  typeDefs: `${__dirname}/schema.graphql`,
  resolvers,
  context: request => ({
    db: new Binding.Prisma({
      typeDefs: `${__dirname}/generated/graphql-schema/prisma.graphql`,
      endpoint: process.env.PRISMA_ENDPOINT
    }),
    prisma,
    ...request
  })
});

async function main() {
  try {
    await server.start();
  
    console.log('Server running on http://localhost:4000');
  } catch(err) {
    console.error(err);
  }
}

main();