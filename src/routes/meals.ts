import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const postMealsBodySchema = z.object({
  name: z.string().min(3, { message: 'name is required' }),
  description: z.string().min(3, { message: 'name is required' }),
  date: z.coerce.date(),
  hour: z.number(),
  isTarget: z.boolean(),
  userId: z.string(),
})

const opts = {
  schema: {
    response: {
      201: {
        type: 'object',
        properties: {
          hello: { type: 'string' },
        },
      },
    },
  },
}

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', opts, async (req, rep) => {
    const result = postMealsBodySchema.safeParse(req.body)

    if (!result.success) {
      return { errors: result.error }
    }

    const { name, description, date, hour, isTarget, userId } = result.data

    console.log(date)

    const user = await prisma.users.findFirst({
      where: {
        id: userId,
      },
    })

    if (!user) {
      return rep.status(404).send({ error: 'User not found exists.' })
    }

    const meal = await prisma.meals.findFirst({
      where: {
        date,
        hour,
      },
    })

    if (meal) {
      return rep
        .status(404)
        .send({ error: 'Meal already exists for date and hour.' })
    }

    await prisma.meals.create({
      data: {
        name,
        description,
        date,
        hour,
        is_target: isTarget,
        user_id: userId,
      },
    })

    rep.status(201)
  })
}
