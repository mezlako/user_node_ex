const mongoose = require('mongoose');
const faker = require('faker');
const Bookmark = require('../../src/models/bookmark.model');
const { userOne, userTwo } = require('./user.fixture');

const bookmarkOne = {
  _id: mongoose.Types.ObjectId(),
  user: userOne._id,
  url: 'https://one.example.com',
  title: faker.lorem.words(3),
};

const bookmarkTwo = {
  _id: mongoose.Types.ObjectId(),
  user: userOne._id,
  url: 'https://two.example.com',
  title: faker.lorem.words(3),
};

// owned by userTwo — used to test ownership enforcement
const bookmarkThree = {
  _id: mongoose.Types.ObjectId(),
  user: userTwo._id,
  url: 'https://three.example.com',
};

const insertBookmarks = async (bookmarks) => {
  await Bookmark.insertMany(bookmarks);
};

module.exports = {
  bookmarkOne,
  bookmarkTwo,
  bookmarkThree,
  insertBookmarks,
};
