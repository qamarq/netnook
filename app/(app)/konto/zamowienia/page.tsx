import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import React from 'react'
import config from '@payload-config'
import { headers } from 'next/headers'
import { Order } from '@/payload-types'
import { redirect } from 'next/navigation'
import { orderStatuses } from '@/constants'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { formattedPrice } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'

export default async function OrdersPage() {
    const payload = await getPayloadHMR({ config })
    const { user } = await payload.auth({ headers: headers() })

    if (!user) { redirect('/login') }

    const orders: any = await payload.find({
        collection: 'orders',
        sort: '-createdAt',
        where: {
            orderedBy: {
                equals: user.id
            }
        }
    })
    
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
                        <BreadcrumbPage>Zamówienia</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <h1 className='mt-3 text-3xl font-semibold tracking-tight mb-10'>Zamówienia</h1>

            <div className='mt-6 space-y-4'>
                {orders.docs.map((order: Order) => (
                    <Link key={order.id} href={`/konto/zamowienia/${order.id}`} className='border w-full flex rounded-lg relative hover:border-slate-600 transition-all'>
                        <div className='p-5 bg-slate-50 w-[260px] rounded-l-lg'>
                            <h1 className='font-semibold'>{orderStatuses[order.status]}</h1>

                            <p className='mt-2 text-sm'>{format(order.createdAt, "dd MMM yyyy | HH:mm", { locale: pl })}</p>
                            <p className='text-sm text-muted-foreground'>nr {order.id}</p>

                            <h1 className='mt-2 font-semibold text-sm'>{formattedPrice(order.total/100)}</h1>
                        </div>
                        <div className='flex-grow p-5 flex items-center'>
                            {order.items?.length === 1 ? (
                                <div className='flex items-center gap-3'>
                                    {typeof order.items[0].product !== 'string' && (
                                        <>
                                            <Image src={order.items[0].product.image?.url || ''} alt='' width={80} height={80} />
                                            <h1 className='font-normal text-muted-foreground line-clamp-1 text-md'>{order.items[0].product.title}</h1>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {order.items?.map((item: any) => (
                                        <div key={item.id} className='flex items-center gap-3'>
                                            {typeof item.product !== 'string' && (
                                                <>
                                                    <Image src={item.product.image?.url || ''} alt='' width={80} height={80} />
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                        <Button size={"icon"} variant={"ghost"} className='absolute top-1 right-1'><Icons.More className='w-5 h-5' /></Button>
                    </Link>
                ))}
            </div>
        </div>
    )
}
