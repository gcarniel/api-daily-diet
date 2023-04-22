import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { createHash } from '../utils/generate-hash'

export async function loginRoutes(app: FastifyInstance) {
  app.post('/login', async (req, rep) => {
    const postLoginBodySchema = z.object({
      email: z.string().email(),
      password: z
        .string()
        .min(8, { message: 'Password must contain at least 8 characters' }),
    })

    const { email, password: userPassword } = postLoginBodySchema.parse(
      req.body,
    )

    const user = await prisma.users.findFirst({
      where: {
        email,
      },
    })

    if (!user) {
      return rep
        .status(404)
        .send({ success: false, message: 'User not found.' })
    }

    const hash = createHash(userPassword)

    if (!(user?.password === hash && user.email === email)) {
      return rep
        .status(404)
        .send({ success: false, message: 'User or password incorret.' })
    }

    const { password, ...userData } = user

    const token = app.jwt.sign({ userData })

    rep.status(201).send({ success: true, data: token })
  })
}
