import React from 'react'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import { headers } from 'next/headers'
// import { lexicalToHTML } from '@/lib/lexicalEditor'
import { NotificationType } from '@/payload-types'
import { generateLexicalHTMLToIframe } from '@/lib/lexicalEditor'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { format } from 'date-fns'
import { revalidatePath } from 'next/cache'

export default async function NotificationDetailsPage({ params }: { params: { id: string } }) {
    const payload = await getPayloadHMR({ config })
    const { user } = await payload.auth({ headers: headers() })
    if (!user) return null

    const notification = (await payload.find({
        collection: 'notifications',
        where: { and: [{ user: { equals: user.id } }, { id: { equals: params.id } }] }
    })).docs[0] as unknown as NotificationType || null

    if (!notification) return null

    await payload.update({
        collection: 'notifications',
        id: notification.id,
        data: {
            read: true
        }
    })
    revalidatePath(`/konto/powiadomienia`)

    return (
        <div className='min-h-[70vh] overflow-hidden'>
            <div className='flex items-center w-full mb-6 px-6'>
                <Link href="/konto/powiadomienia"><Button size={"sm"}><Icons.Left className='w-3 h-3 mr-1' />Pokaż wszystkie powiadomienia</Button></Link>
                <h1 className='text-xl ml-4'><span className='font-semibold'>{notification.title}</span> - {format(notification.createdAt, 'dd.MM.yyyy - HH:mm')}</h1>
            </div>
            <iframe className='w-full h-full' src={generateLexicalHTMLToIframe(notification.message_html)}></iframe>
        </div>
    )
}
