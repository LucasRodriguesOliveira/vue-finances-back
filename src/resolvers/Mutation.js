const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;
const { getUserId } = require('../utils');

async function register(_, args, { db }) {
  const password = await bcrypt.hash(args.password, 10);
  const user = await db.mutation.createUser({ data: { ...args, password } });

  const token = jwt.sign({ userId: user.id }, SECRET, {
    expiresIn: '2h'
  });

  return {
    token, user
  }
}

async function login(_, { email, password }, { db }) {
  const user = await db.query.user({
    where: {
      email
    }
  });

  if(!user) {
    throw new Error("Invalid credentials!");
  }

  const valid = await bcrypt.compare(password, user.password);
  if(!valid) {
    throw new Error("Invalid credentials!");
  }

  const token = jwt.sign({ userId: user.id }, SECRET, {
    expiresIn: '2h'
  });

  return {
    token, user
  }
}

async function createAccount(_, { description } , ctx, info) {
  const userId = getUserId(ctx);
  return ctx.db.mutation.createAccount({
    data: {
      description,
      user: {
        connect: {
          id: userId
        }
      }
    }
  }, info);
}

module.exports = {
  register,
  login,
  createAccount
}