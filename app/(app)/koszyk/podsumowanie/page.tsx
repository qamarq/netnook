"use client"

import React, { useEffect } from 'react'
import Image from "next/image"
import PlaceholderImage from '@/public/assets/placeholder.svg';
import { useAuth } from '@/hooks/Auth';
import { Separator } from '@/components/ui/separator';
import { Order } from '@/payload-types';
import { useSearchParams } from 'next/navigation';
import { getOrderByStripePaymentIntentID } from '@/actions/payments';
import { toast } from 'sonner';
import Stripe from 'stripe';
import { formattedPrice } from '@/lib/utils';
import { paymentStatuses } from '@/constants';
import { Button } from '@/components/ui/button';
import { MutatingDots } from 'react-loader-spinner';
import Link from 'next/link';

export default function SummaryPage() {
    const searchParams = useSearchParams()
    const paymentIntentID = searchParams.get('payment_intent')
    const { user } = useAuth()
    const [order, setOrder] = React.useState<Order | null>(null)
    const [paymentIntent, setPaymentIntent] = React.useState<Stripe.PaymentIntent | null>(null)
    const firstTime = React.useRef(true)

    const fetchOrder = async () => {
        if (!paymentIntentID) return
        await getOrderByStripePaymentIntentID(paymentIntentID)
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
        if (firstTime.current && paymentIntentID) {
            firstTime.current = false
            fetchOrder()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paymentIntentID])

    return (
        <div className='py-24 container mx-auto'>
            <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
                <div className="hidden bg-slate-100 lg:block rounded-l-lg">
                    <Image
                        src={PlaceholderImage}
                        alt="Image"
                        width="1920"
                        height="1080"
                        className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale rounded-l-lg"
                    />
                </div>
                <div className="flex items-center p-12 backdrop-blur-md border rounded-r-lg">
                    <div>
                        <p className='text-xs font-medium text-blue-700'>Wszystko poszło zgodnie z planem 🎉</p>
                        <h1 className='text-4xl mt-1 font-semibold tracking-tight text-slate-900'>Dziękujemy za zamówienie!</h1>
                        <p className='mt-4 text-balance text-sm text-muted-foreground'>Twoje zamówienie jest w trakcie przetwarzania. Wszystkie informacje są dostępne w zakładce Twojego konta a potwierdzenie zamówienia zostało wysłane na <span className='font-semibold text-slate-800'>{user?.email}</span></p>

                        {(order && paymentIntent && order.shippingMethod && typeof order.shippingMethod !== "string") ? (
                            <>
                                <div className='flex items-center justify-between mt-10 text-sm'>
                                    <p className='text-gray-600 font-normal'>Numer zamówienia</p>
                                    <h1 className='font-semibold'>{order?.id}</h1>
                                </div>
                                <Separator className='my-4' />
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
                                                {paymentIntent.payment_method_types[0] === "card" && 'Karta płatnicza' || paymentIntent.payment_method_types[0] === 'blik' && 'Płatność BLIK' || paymentIntent.payment_method_types[0] === 'p24' && 'Płatność Przelewy24'}
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

                                <div className='mt-6 flex items-center justify-end'>
                                    <div className='flex items-center gap-3'>
                                        <Link href="/sklep"><Button variant={"outline"}>Kontynuuj zakupy</Button></Link>
                                        <Link href={`/konto/zamowienia/${order.id}`}><Button>Przejdź do zamówienia</Button></Link>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className='h-full min-h-[500px] flex flex-col items-center justify-center'>
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
                                <h1 className='mt-3 text-xl font-semibold'>Przetwarzanie zamówienia...</h1>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
