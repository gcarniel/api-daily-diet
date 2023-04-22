import fastify, { FastifyRequest } from 'fastify'
import { usersRoutes } from './routes/users'
import { mealsRoutes } from './routes/meals'
import { loginRoutes } from './routes/login'
import jwt from '@fastify/jwt'
import { env } from './env'

export const app = fastify()

app.register(jwt, {
  secret: env.JWT_SECRET,
  sign: { expiresIn: '60m' },
})

app.register(loginRoutes)

app.register(usersRoutes, {
  prefix: 'users',
})

app.register(mealsRoutes, {
  prefix: 'meals',
})
