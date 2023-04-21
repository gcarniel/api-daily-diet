import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', async (req, rep) => {
    const postMealsBodySchema = z.object({
      name: z.string().min(3, { message: 'name is required' }),
      description: z.string().min(3, { message: 'name is required' }),
      date: z.coerce.date(),
      hour: z.number(),
      isTarget: z.boolean(),
      userId: z.string(),
    })

    const result = postMealsBodySchema.safeParse(req.body)

    if (!result.success) {
      return { errors: result.error }
    }

    const { name, description, date, hour, isTarget, userId } = result.data

    const user = await prisma.users.findFirst({
      where: {
        id: userId,
      },
    })

    if (!user) {
      return rep.status(404).send({ error: 'User not found.' })
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

  app.put('/', async (req, rep) => {
    const putMealsBodySchema = z.object({
      name: z.string().min(3, { message: 'name is required' }).optional(),
      description: z
        .string()
        .min(3, { message: 'name is required' })
        .optional(),
      date: z.coerce.date().optional(),
      hour: z.number().optional(),
      isTarget: z.boolean().optional(),
      mealId: z.string(),
    })
    const result = putMealsBodySchema.safeParse(req.body)

    if (!result.success) {
      return { errors: result.error }
    }

    const { name, description, date, hour, isTarget, mealId } = result.data

    const meal = await prisma.meals.findUnique({
      where: {
        id: mealId,
      },
      select: {
        description: true,
        date: true,
        hour: true,
        is_target: true,
        name: true,
        id: true,
      },
    })

    if (!meal) {
      return rep.status(404).send({ error: 'Meal not found.' })
    }

    const updateMeal = {
      ...meal,
      name: name ? name : meal.name,
      description: description ? description : meal.description,
      date: date ? date : meal.date,
      hour: hour ? hour : meal.hour,
      is_target: isTarget ? isTarget : meal.is_target,
    }

    const response = await prisma.meals.update({
      where: { id: meal.id },
      data: {
        ...updateMeal,
      },
    })

    rep.status(200).send({ success: true, data: response })
  })
}
