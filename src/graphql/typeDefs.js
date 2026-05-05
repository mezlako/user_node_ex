const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    isEmailVerified: Boolean!
  }

  type Bookmark {
    id: ID!
    url: String!
    title: String
  }

  type BookmarksResult {
    results: [Bookmark!]!
    page: Int!
    limit: Int!
    totalPages: Int!
    totalResults: Int!
  }

  input CreateBookmarkInput {
    url: String!
    title: String
  }

  type Query {
    me: User
    bookmarks(limit: Int, page: Int): BookmarksResult!
  }

  type Mutation {
    createBookmark(input: CreateBookmarkInput!): Bookmark!
    deleteBookmark(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;
