import { checkRole } from '@/collections/Users/checkRole'
import type { AccessArgs } from 'payload/config'


type isAdmin = (args: any) => boolean

export const admins: isAdmin = ({ req: { user } }) => {
  return checkRole(['admin'], user)
}
