const { getUserId } = require('../utils');
const moment = require('moment');

function user(_, args, ctx, info) {
  const userId = getUserId(ctx);
  return ctx.db.query.user({ where: { id: userId} }, info)
}

function totalBalance(_, { date }, ctx, info) {
  const userId = getUserId(ctx);
  const dateISO = moment(date, 'YYYY-MM-DD').endOf('day').toISOString();
  const pgSchema = `${process.env.PRISMA_SERVICE}$${process.env.PRISMA_STAGE}`;
  const mutation = `mutation totalBalance($database: PrismaDatabase, $query: String!) {
    executeRaw(database: $database, query: $query)
  }`;

  const variables = {
    database: 'default',
    query: `SELECT SUM(amount) as "totalbalance"
              FROM "${pgSchema}"."Record"
             INNER JOIN "${pgSchema}"."User"
                     ON "User".id = "Record"."user"
             WHERE "${pgSchema}"."User".id = '${userId}'
               AND "${pgSchema}"."Record".date <= '${dateISO}'`
  }

  return ctx.prisma.$graphql(mutation, variables)
    .then(res => {
      const totalBalance = res.executeRaw[0].totalbalance;
      return totalBalance ? totalBalance : 0;
    });
}

function accounts(_, args, ctx, info) {
  const userId = getUserId(ctx);
  return ctx.db.query.accounts({
    where: {
      OR: [{
        user: {
          id: userId
        }
      },{
        user: null
      }]
    },
    orderBy: 'description_ASC'
  }, info);
}

function categories(_, { operation }, ctx, info) {
  const userId = getUserId(ctx);

  let AND = [{
    OR: [
      { user: { id: userId } },
      { user: null }
    ]
  }];

  operation && AND.push({ operation });

  return ctx.db.query.categories({
    where: { AND },
    orderBy: 'description_ASC'
  }, info);
}

function records(_, { month, type, accountsIds, categoriesIds }, ctx, info) {
  const userId = getUserId(ctx);

  let AND = [ { user: { id: userId } }];

  type && AND.push({ type });
  
  !!accountsIds && accountsIds.length > 0 && AND.push({
    OR: accountsIds.map(id => ({ account: { id } }))
  });

  !!categoriesIds && categoriesIds.length > 0 && AND.push({
    OR: categoriesIds.map(id => ({ category: { id } }))
  });

  if(month) {
    const date = moment(month, 'MM-YYYY');
    const sDate = date.startOf('month').toISOString();
    const eDate = date.endOf('month').toISOString();

    AND.push({ date_gte: sDate }, { date_lte: eDate });
  }

  return ctx.db.query.records({
    where: { AND },
    orderBy: 'date_ASC'
  }, info);
}

module.exports = {
  user,
  accounts,
  categories,
  records,
  totalBalance
};