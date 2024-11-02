"use client"

import { getOrderByID } from '@/actions/payments'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/Auth'
import { Order } from '@/payload-types'
import React, { useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import Stripe from 'stripe'
import Image from "next/image"
import { formattedPrice } from '@/lib/utils'
import { paymentMethodLabels, paymentStatuses } from '@/constants'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { MutatingDots } from 'react-loader-spinner'
import PlaceholderImage from '@/public/assets/placeholder.svg';
import { format } from 'date-fns'
import { Icons } from '@/components/icons'
import Stepper from 'react-stepper-horizontal';

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
    const { user } = useAuth()
    const [order, setOrder] = React.useState<Order | null>(null)
    const [paymentIntent, setPaymentIntent] = React.useState<Stripe.PaymentIntent | null>(null)
    const firstTime = React.useRef(true)

    const fetchOrder = async () => {
        if (!params.id) return
        await getOrderByID(params.id)
            .then(data => {
                if (data.success) {
                    setOrder(data.order as Order)
                    setPaymentIntent(data.paymentIntent || null)
                } else {
                    toast.error(data.error)
                }
            })
    }

    useEffect(() => {
        if (firstTime.current) {
            firstTime.current = false
            fetchOrder()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const currentStep = useMemo(() => {
        if (!order) return 0
        if (order.status === 'created') return 0
        if (order.status === 'paid') return 1
        if (order.status === 'processing') return 2
        if (order.status === 'shipped') return 3
        if (order.status === 'delivered') return 4
        if (order.status === 'canceled') return 4
        return 0
    }, [order])
    
    return (
        <div>
            {(order && paymentIntent && order.shippingMethod && typeof order.shippingMethod !== "string") ? (
                <>
                    <div className='flex items-center w-full mb-6 px-6'>
                        <Link href="/konto/zamowienia"><Button size={"sm"}><Icons.Left className='w-3 h-3 mr-1' />Pokaż wszystkie zamówienia</Button></Link>
                    </div>
                    <div>
                        <Stepper
                            steps={[
                                { title: 'Nowe' },
                                { title: 'Opłacone' },
                                { title: 'W realizacji' },
                                { title: 'Wysłane' },
                                { title: 'Zakończone' },
                            ]}
                            activeStep={currentStep}
                            activeColor="#0f172a"
                            completeColor="#0f172a"
                        />
                    </div>
                    <div className='p-6'>
                        <p className='text-xs font-medium text-blue-700'>Złożone dnia {order && format(order.createdAt, "dd.MM.yyyy - HH:mm")} 🎉</p>
                        <h1 className='text-4xl mt-1 font-semibold tracking-tight text-slate-900'>Zamówienie nr {params.id}</h1>
                        <p className='mt-4 text-balance text-sm text-muted-foreground mb-10'>Potwierdzenie zamówienia zostało wysłane na adres <span className='font-semibold text-slate-800'>{user?.email}</span></p>

                        <div className='border rounded-lg p-6'>
                            <div className='flex flex-col space-y-3'>
                                {order.items?.map((item, index) => {
                                    if (!item.product || typeof item.product === "string") return null

                                    return (
                                        <div key={item.id} className='flex items-center'>
                                            <div className='w-16 h-16 relative'>
                                                <Image
                                                    src={item.product.image?.url || PlaceholderImage}
                                                    alt={item.product.title}
                                                    layout='fill'
                                                    objectFit='cover'
                                                    className='rounded-md'
                                                />
                                            </div>
                                            <div className='ml-4'>
                                                <h1 className='text-sm font-semibold'>{item.product.title}</h1>
                                                <p className='text-xs text-muted-foreground'>{item.quantity} szt.</p>
                                                <p className='text-xs text-muted-foreground'>{item.price && formattedPrice(item.price/100)}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <Separator className='my-4' />
                            <div className='space-y-4'>
                                <div className='flex items-center justify-between text-sm'>
                                    <p className='text-gray-600 font-normal'>Kwota zamówienia</p>
                                    <h1 className='font-semibold'>{formattedPrice(((order.total - (order.total * 0.23)) - (order.shippingMethod.price * 100)) / 100)}</h1>
                                </div>
                                <div className='flex items-center justify-between text-sm'>
                                    <p className='text-gray-600 font-normal'>Podatek</p>
                                    <h1 className='font-semibold'>(23%) {formattedPrice((order.total * 0.23)/100)}</h1>
                                </div>
                                <div className='flex items-center justify-between text-sm'>
                                    <p className='text-gray-600 font-normal'>Dostawa</p>
                                    <div className='flex items-center'>
                                        <Image src={order.shippingMethod.logo.url || ''} alt={order.shippingMethod.title} width={25} height={25} className='rounded-sm mr-2' />
                                        <h1 className='font-semibold'>({order.shippingMethod.title}) {formattedPrice(order.shippingMethod.price)}</h1>
                                    </div>
                                </div>
                                <div className='flex items-center justify-between text-sm'>
                                    <p className='text-gray-600 font-normal'>Metoda płatności</p>
                                    <div className='flex items-center'>
                                        <Image src={`/assets/cards/${paymentIntent.payment_method_types[0] === 'card' ? 'visa' : paymentIntent.payment_method_types[0]}.png`} alt={paymentIntent.payment_method_types[0]} width={40} height={20} className='rounded-sm mr-2' />
                                        <h1 className='font-semibold'>
                                            {paymentMethodLabels[paymentIntent.payment_method_types[0]] || 'Nieznana metoda płatności'}
                                        </h1>
                                    </div>
                                </div>
                                <div className='flex items-center justify-between text-sm'>
                                    <p className='text-gray-600 font-normal'>Status płatności</p>
                                    <h1 className='font-semibold'>{paymentStatuses[paymentIntent.status]}</h1>
                                </div>
                            </div>
                            <Separator className='my-4' />
                            <div className='flex items-center justify-between text-sm'>
                                <p className='text-gray-600 font-semibold'>W sumie</p>
                                <h1 className='font-semibold'>{formattedPrice(order.total/100)}</h1>
                            </div>
                        </div>

                        <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div>
                                <h1 className='text-xl font-semibold mb-2'>Adres odbioru</h1>
                                <div className='border p-4 rounded-lg'>
                                    <h1 className='text-md font-semibold mb-2'>Dostawa pod adres</h1>
                                    <h2>{paymentIntent.shipping?.address?.line1}, {paymentIntent.shipping?.address?.line2}</h2>
                                    <h2>{paymentIntent.shipping?.address?.postal_code} {paymentIntent.shipping?.address?.city}</h2>
                                </div>
                            </div>

                            <div>
                                <h1 className='text-xl font-semibold mb-2'>Dane odbiorcy</h1>
                                <div className='border p-4 rounded-lg'>
                                    <h1 className='text-md font-semibold mb-2'>{paymentIntent.shipping?.name}</h1>
                                    <h2>tel: {paymentIntent.shipping?.phone}</h2>
                                    <h2>email: {user?.email}</h2>
                                </div>
                            </div>
                        </div>

                        <div className='mt-6'>
                            <h1 className='text-xl font-semibold mb-2'>Dostawa</h1>
                            <div className='border p-4 rounded-lg'>
                                <div className='flex items-center'>
                                    <Image src={order.shippingMethod.logo.url || ''} alt={order.shippingMethod.title} width={40} height={40} className='rounded-sm mr-2' />
                                    <h1 className='font-semibold text-lg ml-2'>{order.shippingMethod.title} - <span className='font-medium text-md'>Szacowany czas dostawy: {order.shippingMethod.deliveryDaysTime} {order.shippingMethod.deliveryDaysTime === 1 ? 'dzień' : 'dni'}</span></h1>
                                </div>
                                {(order.trackingNumber && order.trackingNumber !== undefined) && (
                                    <div className='mt-4 flex items-center gap-2 border-t pt-2'>
                                        <h1 className='font-semibold'>Numer śledzenia:</h1>
                                        <h2>{order.trackingNumber}</h2>

                                        <Button size={"icon"} variant={order.trackingUrl ? "outline" : 'default'} onClick={() => {
                                            navigator.clipboard.writeText(order.trackingNumber || '')
                                            toast.success('Numer śledzenia został skopiowany do schowka')
                                        }}><Icons.Copy className='w-4 h-4' /></Button>
                                        {order.trackingUrl && (
                                            <Link href={order.trackingUrl} target='_blank'><Button size={"icon"}><Icons.OpenLink className='w-4 h-4' /></Button></Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className='mt-6'>
                            <h1 className='text-xl font-semibold mb-2'>Płatność</h1>
                            <div className='border p-4 rounded-lg'>
                                <div className='flex items-center'>
                                    <Image src={`/assets/cards/${paymentIntent.payment_method_types[0] === 'card' ? 'visa' : paymentIntent.payment_method_types[0]}.png`} alt={paymentIntent.payment_method_types[0]} width={50} height={40} className='rounded-sm mr-2' />
                                    <h1 className='font-semibold text-lg ml-2'>{paymentMethodLabels[paymentIntent.payment_method_types[0]] || 'Nieznana metoda płatności'}</h1>
                                    
                                    {paymentIntent.status === 'requires_action' && order.status === 'created' && (
                                        <Button size='sm' className='ml-4' onClick={() => console.log("ssss")}>Zapłać ponownie ({formattedPrice(order.total/100)})</Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className='h-full min-h-[700px] flex flex-col items-center justify-center'>
                    <MutatingDots
                        visible={true}
                        height="100"
                        width="100"
                        color="#0f172a"
                        secondaryColor="#0f172a"
                        radius="12.5"
                        ariaLabel="mutating-dots-loading"
                        wrapperStyle={{}}
                        wrapperClass=""
                    />
                    <h1 className='mt-3 text-xl font-semibold'>Wczytywanie zamówienia...</h1>
                </div>
            )}
        </div>
    )
}
