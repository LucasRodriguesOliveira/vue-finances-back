const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

function getUserId(ctx) {
  const Authorization = ctx.request.get('Authorization');

  if(Authorization) {
    const token = Authorization.replace('Bearer ', '');
    const { userId } = jwt.verify(token, SECRET)
    return userId;
  }

  throw new Error("Not authenticated!");
}

module.exports = {
  getUserId
}