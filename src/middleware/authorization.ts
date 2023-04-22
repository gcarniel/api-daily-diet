import { FastifyReply, FastifyRequest } from 'fastify'

export async function checkTokenExists(req: FastifyRequest, rep: FastifyReply) {
  const [, token] = req.headers.authorization?.split(' ') || [' ', ' ']

  if (!token) {
    rep.status(401).send({ success: false, message: 'Unauthorized' })
  }

  try {
    await req.jwtVerify()
  } catch (errror) {
    rep.send({ success: false, message: errror })
  }
}
