import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import { createHash } from '../utils/generate-hash'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (req, rep) => {
    const postUsersBodySchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    })

    const { name, email, password } = postUsersBodySchema.parse(req.body)

    const user = await prisma.users.findFirst({
      where: {
        email,
      },
    })

    if (user) {
      return rep.status(404).send({ error: 'User already exists.' })
    }

    const hash = createHash(password)

    await prisma.users.create({
      data: {
        name,
        email,
        password: hash,
      },
    })

    rep.status(201)
  })
}
