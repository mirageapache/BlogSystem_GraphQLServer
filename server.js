const {ApolloServer} = require('apollo-server');
const jwt = require('jsonwebtoken');
const resolvers = require('./resolvers');
const typeDefs = require('./schema');
const {userModel, postModel} = require('./models');
require('dotenv').config();

// ====== 宣告 ======
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);
const SECRET = process.env.SECRET;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    // 取得 token
    const context = {
      secret: SECRET, 
      saltRounds: SALT_ROUNDS,
      userModel: userModel,
      postModel: postModel,
    };
    const token = req.headers['x-token'];
    if(token){
      try {
        // 檢查 token，並解析
        const me = await jwt.verify(token, SECRET);
        return { me, ...context }; // 回傳 token，存到 context
      }
      catch (e) {
        throw new Error('Your session expired. Sign in again.');
      }
    }
    return context; // 如果沒有 token就回傳空的 context
  }
});

server.listen({port: process.env.PORT || 4000}).then(({url}) => {
  console.log(`Server ready at ${url}`);
});