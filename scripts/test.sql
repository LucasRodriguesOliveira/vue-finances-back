SELECT SUM(amount) "totalBalanca"
  FROM "vue-finances-back$dev"."Record"
 INNER JOIN "vue-finances-back$dev"."User"
         ON "User".id = "Record"."user"
 WHERE "vue-finances-back$dev"."User".id = 'ck7ml3q88002u0700r2d094sz'
   AND "vue-finances-back$dev"."Record".date <= '2020-03-11T00:00:00.0000Z'