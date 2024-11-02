import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import React from 'react'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { NotificationType } from '@/payload-types'
import { format } from 'date-fns'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Icons } from '@/components/icons'

export default async function NotificationsPage() {
    const payload = await getPayloadHMR({ config })
    const { user } = await payload.auth({ headers: headers() })
    if (!user) return notFound()

    const notifications = await payload.find({
        collection: 'notifications',
        where: { user: { equals: user.id } }
    })

    const currentNotifications = notifications.docs as unknown as NotificationType[]

    return (
        <div className=''>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">NetNook</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/konto">Konto</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Powiadomienia</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <h1 className='mt-3 text-3xl font-semibold tracking-tight mb-10'>Powiadomienia</h1>

            <div className='mt-4'>
                {currentNotifications.map((notification) => (
                    <Link href={`/konto/powiadomienia/${notification.id}`} key={notification.id}>
                        <div className='bg-white rounded-lg border p-4 mb-4 cursor-pointer flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                                {notification.type === 'info' && (
                                    <div className='bg-blue-50 p-3 rounded-lg'>
                                        <Icons.Info className='text-blue-600' />
                                    </div>
                                )}
                                {notification.type === 'warning' && (
                                    <div className='bg-yellow-50 p-3 rounded-lg'>
                                        <Icons.Warning className='text-yellow-600' />
                                    </div>
                                )}
                                {notification.type === 'error' && (
                                    <div className='bg-rose-50 p-3 rounded-lg'>
                                        <Icons.Error className='text-rose-600' />
                                    </div>
                                )}
                                <div>
                                    <h2 className={cn('text-xl', { 'font-semibold': !notification.read })}>{notification.title}</h2>
                                    <p className='text-sm text-gray-500'>SYSTEM - {format(notification.createdAt, 'dd.MM.yyyy - HH:mm')}</p>
                                </div>
                            </div>

                            <div className={cn('py-1.5 px-3 rounded-full text-xs font-semibold', { 'bg-emerald-100 text-emerald-800': notification.read, 'bg-primary text-white': !notification.read })}>{notification.read ? 'Przeczytano' : 'Nowe powiadomienie'}</div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
