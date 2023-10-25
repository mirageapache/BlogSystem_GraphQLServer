const { ForbiddenError } = require('apollo-server');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const bcrypt = require('bcrypt');
const { users, posts } = require('./mockData');
// const { userModel } = require('./models');

// 驗證(使用)是否登入
const isAuthenticated = resolverFunc => (parent, args, context) => {
  const {me, userModel} = context;
  if(!me) throw new ForbiddenError('Not login yet');
  return resolverFunc.apply(null, [parent,args,context]);
}
// 驗證身份(權限)
const isPostAuthor = resolverFunc => (parent, args, context) => {
  const { postId } = args;
  const { me, postModel } = context;
  const isAuthor = postModel.findPostByPostId(postId).authorId === me.id;
  if(!isAuthor) throw new ForbiddenError('Only author can delete this post');
  return resolverFunc.apply(null, [parent, args, context]);
}

// ====== resolver ======
const resolvers = {
  Query: {
    hello: () => 'hello world',
    me: isAuthenticated((root, args, {me, userModel}) => userModel.findUserByUserId(me.id)),
    users: () => users,
    user: (root, {name}, {userModel}) => userModel.findUserByName(name),
    posts: () => posts,
    post : (root, {id}, {postModel}) => postModel.findPostByPostId(id),
    now: () => new Date(),
    isFriday: (root, {date}) => date.getDay() === 5
  },
  User:{
    // 取得貼文
    posts: (parent, args, {postModel}) => postModel.filterPostsByUserId(parent.id),
    // 取得朋友列表
    friends: (parent, args, {userModel}) => userModel.filterUserByUserIds(parent.friendIds || []),
  },
  Post:{
    // 取得貼文作者
    author: (parent, args, {userModel}) => userModel.findUserByUserId(parent.authorId),
    // 取得貼文按讚的人
    likeGivers: (parent, args, {userModel}) => userModel.filterUserByUserIds(parent.likeGiverIds),
  },
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    serialize(value) {
      // 輸出到前端(client)
      return value;
    },
    parseValue(value) {
      // 從前端(client)來的參數
      return new Date(value);
    },
    parseLiteral(ast){
      // 從前端 inline variables 進來的 input
      if(ast.kind === Kind.INT){
        return new Date(parseInt(ast.value, 10)); // ast的值通常為string格式
      }
      return null;
    }

  }),
  Mutation:{
    // 更新個人資料
    updateMyInfo: isAuthenticated((parent, {input}, {me, userModel}) => {
      // 過濾空值
      const data = ["name","age"].reduce((obj, key) => 
        (input[key] ? {...obj, [key]: input[key] }: obj),{});
        return userModel.updateUserInfo(me.id, data);
    }),
    // 新增好友
    addFriend: isAuthenticated((parent, {userId}, {me: {id: meId}, userModel}) => {
      const me = userModel.findUserByUserId(meId);
      if(me.friendIds.includes(userId))
        throw new Error(`User ${userId} already exists`);

      const friend = userModel.findUserByUserId(userId);
      const newMe = userModel.updateUserInfo(meId, {
        friendIds: me.friendIds.concat(userId)
      });
      // updateUserInfo(userId, { friendIds: friend.friendIds.concat(meId)});
      return newMe;
    }),
    // 新增貼文
    addPost: isAuthenticated((parent, {title, content}, {me, postModel}) => {
      // const {title, content} = input;
      return postModel.addPost({authorId: me.id, title, content});
    }),
    // addPost: (parent, {title, content}, {postModel}) => {
    //   return postModel.addPost({authorId: 1, title, content});
    // },
    // 貼文按讚
    likePost: isAuthenticated((parent, {postId}, {me, postModel}) => {
      const post = postModel.findPostByPostId(postId);
      if(!post) throw new Error(`Post ${postId} not exists`);
      if(!post.likeGiverIds.includes(me.id)){
        // 按讚
        return postModel.updatePost(postId, {likeGiverIds: post.likeGiverIds.concat(me.id)});
      }
      else{
        // 取消按讚
        return postModel.updatePost(postId,{likeGiverIds: post.likeGiverIds.filter(id => id != me.id)});
      }
    }),
    // 刪除貼文
    deletePost: isAuthenticated(
      isPostAuthor((root, {postId}, {postModel}) => postModel.deletePost(postId))
    ),
    // 註冊
    signUp: async(root, {name, email, password}, {saltRounds, userModel}) => {
      // 檢查不能有重複註冊的email
      const isUserEmailDuplicate = users.some(user => {
        user.email === email
      });
      if (isUserEmailDuplicate) throw new Error(`User Email Duplicate`);
      // 將 password 加密後再存進去
      const hashedPassword = await userModel.hash(password, saltRounds);
      // 建立新 user
      return userModel.addUser({name , email, password: hashedPassword});
    },
    // 登入
    login: async (root, {email, password}, {secret, userModel}) => {
      // 透過 email找到相對應的 user
      console.log(email, password)
      const user = users.find(user => user.email === email);
      if(!user) throw new Error('Email account not exists');

      // 將傳進來的 password 與資料庫存的 user.password 做比對
      const passwordIsValid = await bcrypt.compare(password, user.password);
      if(!passwordIsValid) throw new Error('Wrong password');

      // 登入成功則回傳 token
      return {token: await userModel.createToken(user, secret)};
    },
  }
}

module.exports = resolvers;