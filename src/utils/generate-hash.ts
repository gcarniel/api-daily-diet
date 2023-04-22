import cripto from 'node:crypto'

export function createHash(password: string) {
  const hash = cripto.createHash('sha256')

  hash.update(password)

  const encodedPassword = hash.digest('hex')

  return encodedPassword
}
