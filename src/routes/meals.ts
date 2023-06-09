import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { checkTokenExists } from '../middleware/authorization'

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      onRequest: [checkTokenExists],
    },
    async (req: FastifyRequest, rep: FastifyReply) => {
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
        return rep.status(404).send({ success: false, error: result.error })
      }

      const { name, description, date, hour, isTarget, userId } = result.data

      const user = await prisma.users.findFirst({
        where: {
          id: userId,
        },
      })

      if (!user) {
        return rep
          .status(404)
          .send({ success: false, message: 'User not found.' })
      }

      const meal = await prisma.meals.findFirst({
        where: {
          date,
          hour,
        },
      })

      if (meal) {
        return rep.status(404).send({
          success: false,
          message: 'Meal already exists for date and hour.',
        })
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

      rep.status(201).send({ success: true })
    },
  )

  app.put(
    '/:id',
    {
      onRequest: [checkTokenExists],
    },
    async (req: FastifyRequest, rep: FastifyReply) => {
      const putMealsBodySchema = z.object({
        name: z.string().min(3, { message: 'name is required' }).optional(),
        description: z
          .string()
          .min(3, { message: 'name is required' })
          .optional(),
        date: z.coerce.date().optional(),
        hour: z.number().optional(),
        isTarget: z.boolean().optional(),
      })

      const putMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const resultParams = putMealParamsSchema.safeParse(req.params)

      if (!resultParams.success) {
        return rep
          .status(404)
          .send({ success: false, message: 'Meal id not found in params.' })
      }

      const { id } = resultParams.data

      const result = putMealsBodySchema.safeParse(req.body)

      if (!result.success) {
        return rep.status(404).send({ success: false, message: result.error })
      }

      const body = Object.values(result.data)

      if (body.length === 0) {
        return rep.status(200).send({ success: true })
      }

      const { name, description, date, hour, isTarget } = result.data

      const meal = await prisma.meals.findUnique({
        where: {
          id,
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
        return rep
          .status(404)
          .send({ success: false, message: 'Meal not found.' })
      }

      const updateMeal = {
        ...meal,
        name: name ? name : meal.name,
        description: description ? description : meal.description,
        date: date ? date : meal.date,
        hour: hour ? hour : meal.hour,
        is_target: isTarget ? isTarget : meal.is_target,
      }

      await prisma.meals.update({
        where: { id: meal.id },
        data: {
          ...updateMeal,
        },
      })

      rep.status(204).send({ success: true })
    },
  )

  app.delete(
    '/:id',
    {
      onRequest: [checkTokenExists],
    },
    async (req: FastifyRequest, rep: FastifyReply) => {
      const deleteMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const resultParams = deleteMealParamsSchema.safeParse(req.params)

      if (!resultParams.success) {
        return rep.status(404).send({
          success: false,
          message: 'Meal id not found in params or is not a uuid format.',
        })
      }

      const { id } = resultParams.data

      const meal = await prisma.meals.findUnique({ where: { id } })

      if (!meal) {
        return rep
          .status(404)
          .send({ success: false, message: 'Meal not found.' })
      }

      await prisma.meals.delete({
        where: {
          id,
        },
      })

      rep.status(202).send({ success: true })
    },
  )

  app.get(
    '/',
    {
      onRequest: [checkTokenExists],
    },
    async (req: FastifyRequest, rep: FastifyReply) => {
      const getMealQueryParamsSchema = z.object({
        userId: z.string().uuid(),
      })

      const result = getMealQueryParamsSchema.safeParse(req.query)

      if (!result.success) {
        return rep.status(404).send({
          success: false,
          message:
            'key userId not found in query params or is not a uuid format.',
        })
      }

      const { userId } = result.data

      const meals = await prisma.meals.findMany({ where: { user_id: userId } })

      rep.status(200).send({ success: true, data: meals })
    },
  )

  app.get(
    '/:id',
    {
      onRequest: [checkTokenExists],
    },
    async (req: FastifyRequest, rep: FastifyReply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const resultParams = getMealParamsSchema.safeParse(req.params)

      if (!resultParams.success) {
        return rep.status(404).send({
          success: false,
          message: 'Meal id not found in params or is not a uuid format.',
        })
      }

      const { id } = resultParams.data

      const meal = await prisma.meals.findUnique({ where: { id } })

      if (!meal) {
        return rep
          .status(404)
          .send({ success: false, message: 'Meal not found.' })
      }

      rep.status(200).send({ success: true, data: meal })
    },
  )

  app.get(
    '/amount',
    {
      onRequest: [checkTokenExists],
    },
    async (req: FastifyRequest, rep: FastifyReply) => {
      const getMealQueryParamsSchema = z.object({
        userId: z.string().uuid(),
      })

      const result = getMealQueryParamsSchema.safeParse(req.query)

      if (!result.success) {
        return rep.status(404).send({
          success: false,
          message:
            'key userId not found in query params or is not a uuid format.',
        })
      }

      const { userId } = result.data

      const amount = await prisma.meals.count({ where: { user_id: userId } })

      rep.status(200).send({ success: true, data: { amount } })
    },
  )

  app.get(
    '/target',
    {
      onRequest: [checkTokenExists],
    },
    async (req: FastifyRequest, rep: FastifyReply) => {
      const getMealQueryParamsSchema = z.object({
        userId: z.string().uuid(),
      })

      const result = getMealQueryParamsSchema.safeParse(req.query)

      if (!result.success) {
        return rep.status(404).send({
          success: false,
          message:
            'key userId not found in query params or is not a uuid format.',
        })
      }

      const { userId } = result.data

      const mealsIn = await prisma.meals.count({
        where: {
          user_id: userId,
          is_target: true,
        },
      })

      const mealsOut = await prisma.meals.count({
        where: {
          user_id: userId,
          is_target: false,
        },
      })

      rep.status(200).send({ success: true, data: { mealsIn, mealsOut } })
    },
  )
}
