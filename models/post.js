const {posts} = require('../mockData');


// ====== Query Helper Functions ======
const findPostByPostId = postId =>  posts.find(post => post.id === Number(postId));
const filterPostsByUserId = userId => posts.filter(post => userId === post.authorId);


// ====== Mutation Helper Functions ======
const addPost = ({ authorId, title, content }) => {
  posts[posts.length] = {
    id: posts[posts.length -1].id + 1,
    authorId,
    title,
    content,
    likeGiverIds: [],
    createdAt: new Date().toISOString()
  }
};
const updatePost = (postId, data) => Object.assign(findPostByPostId(postId), data);
const deletePost = (postId) => {
  posts.splice(posts.findIndex(post => post.id === Number(postId)), 1)
};

module.exports = {
  findPostByPostId,
  filterPostsByUserId,
  addPost,
  updatePost,
  deletePost,
}