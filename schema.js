const { gql } = require('apollo-server');

const typeDefs = gql`
  """
  使用者
  """
  type User {
    "識別碼" id: ID!
    "帳號"
    email: String!
    "名字"
    name: String
    "年齡"
    age: Int
    "好友"
    friends: [User]
    "貼文"
    posts: [Post]
  }

  """
  貼文
  """
  type Post{
    "識別碼"
    id: ID!
    "標題"
    title: String
    "內容"
    content: String
    "作者"
    author: User
    "按讚者"
    likeGivers: [User]
    "建立時間(ISO格式)"
    createdAt: String
  }

  """
  日期
  """
  scalar Date

  type Query{
    "測試用"
    hello: String
    "目前使用者資料"
    me: User
    "取得所有使用者"
    users: [User]
    "依名字取得特別使用者"
    user(name: String!): User
    "取得所有貼文"
    posts: [Post]
    "依id取得特定貼文"
    post(id: ID!): Post
    "現在時間"
    now: Date
    "確認日期是否為週五"
    isFriday(date: Date!): Boolean
  }

  input UpdateMyInfoInput {
    name: String
    age: Int
  }

  input AddPostInput {
    title: String!
    content: String
  }

  type Token{
    token: String!
  }

  type Mutation {
    "更新個人資訊"
    updateMyInfo(input: UpdateMyInfoInput!): User
    "新增好友"
    addFriend(userId: ID!): User
    "新增貼文"
    addPost(input: AddPostInput!): Post
    "貼文按讚"
    likePost(postId: ID!): Post
    "刪除貼文"
    deletePost(postId: ID!): Post
    "註冊"
    signUp(name: String, email: String!, password: String!): User
    "登入"
    login (email: String!, password: String!): Token
  }

`;

module.exports = typeDefs;