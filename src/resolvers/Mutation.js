const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment');

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

function createAccount(_, { description } , ctx, info) {
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

function createCategory(_, { description, operation } , ctx, info) {
  const userId = getUserId(ctx);
  return ctx.db.mutation.createCategory({
    data: {
      description,
      operation,
      user: {
        connect: {
          id: userId
        }
      }
    }
  }, info);
}

function createRecord(_, args , ctx, info) {
  const date = moment(args.date)
  if(!date.isValid())
    throw new Error("Invalid date!");

  const userId = getUserId(ctx);
  return ctx.db.mutation.createRecord({
    data: {
      user: {
        connect: { id: userId }
      },
      account: {
        connect: {
          id: args.accountId
        }
      },
      category: {
        connect: {
          id: args.categoryId
        }
      },
      amount: args.amount,
      type: args.type,
      date: args.date,
      description: args.description,
      tags: args.tags,
      note: args.note
    }
  }, info);
}

module.exports = {
  register,
  login,
  createAccount,
  createCategory,
  createRecord
}