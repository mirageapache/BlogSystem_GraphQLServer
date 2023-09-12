const { ForbiddenError } = require('apollo-server');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { users, posts } = require('../mockData');
const userModel = require('./user');
const postModel = require('./post');


module.exports = {
  userModel,
  postModel,
}
