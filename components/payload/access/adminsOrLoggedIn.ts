import { checkRole } from '@/collections/Users/checkRole'
import { User } from '@/payload-types'
import type { Access, AccessArgs } from 'payload/config'


export const adminsOrLoggedIn: Access = ({ req }: AccessArgs<User>) => {
  if (checkRole(['admin'], req.user)) {
    return true
  }

  return !!req.user
}
