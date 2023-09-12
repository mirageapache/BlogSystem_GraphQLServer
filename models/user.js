const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { users } = require('../mockData');

// ====== Query Helper Functions ======
const findUserByName = name => users.find(user => user.name === name);
const findUserByUserId = userId => users.find(user => user.id === Number(userId));
const filterUserByUserIds =  userIds => users.filter(user => userIds.includes(user.id));


// ====== Mutation Helper Functions ======
const hash = (text, saltRounds) => bcrypt.hash(text, saltRounds);
const createToken = ({id, email, name}, secret) => 
jwt.sign({ id, email, name }, secret, { expiresIn: '1d' });

const updateUserInfo = (userId, data) => Object.assign(findUserByUserId(userId), data);
const addUser = ({name, email, password}) => (
  users[users.length] = {
    id: users[users.length - 1].id + 1,
    name,
    email,
    password
  }
);

module.exports ={
  findUserByName,
  findUserByUserId,
  filterUserByUserIds,
  hash,
  createToken,
  updateUserInfo,
  addUser,
}

