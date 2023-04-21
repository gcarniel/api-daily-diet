import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

export async function usersRoutes(app: FastifyInstance) {
  app.get('/', async (req, rep) => {
    console.log(req.body)

    // await prisma.users.create({
    //   data: {
    //     name: 'gabriel',
    //     email: 'gabriel!@',
    //     password: '123',
    //   },
    // })
    return 'hello, world'
  })

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

    await prisma.users.create({
      data: {
        name,
        email,
        password,
      },
    })

    rep.status(201)
  })
}
