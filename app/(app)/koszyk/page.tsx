"use client"

import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/Auth'
import { useCart } from '@/hooks/Cart'
import { cn, formattedPrice, getPriceFromJSON } from '@/lib/utils'
import Image from 'next/image'
import React, { useEffect, useMemo } from 'react'
import EmptyCartImage from "@/public/assets/no_cart.png"
import { ShippingMethod } from '@/payload-types'
import { getAllShippingMethodsAndPaymentMethods } from '@/actions/shippingMethods'
import { toast } from 'sonner'
import { createPaymentIntent } from '@/actions/payments'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe, type PaymentMethod, type StripeElementLocale } from '@stripe/stripe-js'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import VisaLogo from '@/public/assets/cards/visa.png'
import MastercardLogo from '@/public/assets/cards/mastercard.png'
import BlikLogo from '@/public/assets/cards/blik.png'
import Przelewy24Logo from '@/public/assets/cards/p24.png'
import PaymentForm from './_components/PaymentForm'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CartPage() {
    const route = useRouter()
    const { user } = useAuth()
    const { cart, cartTotal, deleteItemFromCart } = useCart()
    const [step, setStep] = React.useState(1)
    const [shippingMethods, setShippingMethods] = React.useState<ShippingMethod[] | null>(null)
    const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[] | null>(null)
    const [selectedShippingMethod, setSelectedShippingMethod] = React.useState<ShippingMethod | null>(null)
    const [clientSecret, setClientSecret] = React.useState<string | null>(null)
    const [isLoading, startTransition] = React.useTransition()
    const [selectedPaymentType, setSelectedPaymentType] = React.useState<'card' | 'blik' | 'p24' | null>(null)
    const [selectedCardId, setSelectedCardId] = React.useState<string | null>(null)
    const [requiresAction, setRequiresAction] = React.useState<boolean>(false)
    
    const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

    const fetchData = async () => {
        await getAllShippingMethodsAndPaymentMethods()
            .then(async (data) => {
                if (data.success) {
                    setShippingMethods(data.shippingMethods || [])
                    setPaymentMethods(data.paymentMethods as any || [])
                } else {
                    toast.error('Nie udało się pobrać metod dostawy')
                }
            })
    }

    const isAddressShippingProvided = useMemo(() => {
        if (!user || user.groupAddressShipping === undefined || user.groupAddressShipping === null || !user.groupAddressShipping.city || !user.groupAddressShipping.zip || !user.groupAddressShipping.streetLine1) return false
        return true
    }, [user])

    const isStep2Completed = useMemo(() => {
        if (!isAddressShippingProvided) return false
        if (selectedShippingMethod && selectedPaymentType) {
            if (selectedPaymentType === 'card' && selectedCardId) return true
            if (selectedPaymentType === 'blik' || selectedPaymentType === 'p24') return true
        }

        return false
    }, [selectedShippingMethod, selectedPaymentType, selectedCardId, isAddressShippingProvided])

    const handlePreparePayment = () => {
        if (!selectedShippingMethod || !cart || !cart.items || cart.items == undefined || cart.items.length === 0) {
            toast.error('Wybierz metodę dostawy')
            return
        }

        startTransition(async () => {
            if (!cartTotal || !cartTotal.raw || cartTotal.raw === 0 || !selectedShippingMethod || !selectedPaymentType || !user) {
                toast.error('Wystąpił błąd podczas obliczania ceny')
                return
            }

            await createPaymentIntent(cart as any, cartTotal, selectedShippingMethod, selectedPaymentType, selectedCardId).then((response) => {
                if (response.success) {
                    setClientSecret(response.clientSecret || '')
                    // setStep(prev => prev + 1)
                    if (response.status === 'succeeded') {
                        route.push(`/koszyk/podsumowanie?payment_intent=${response.paymentId}&payment_intent_client_secret=${response.clientSecret}`)
                    } else {
                        if (response.status === 'requires_action') {
                            setRequiresAction(true)
                        }
                        setStep(prev => prev + 1)
                    }
                } else {
                    console.log(response)
                    toast.error('Wystąpił błąd podczas tworzenia sesji płatności')
                }
            })
        })
    }

    const appearance = {
        theme: 'flat' as "flat",
        variables: {
            colorPrimary: '#0f172a',
        },
    };

    const options = {
        clientSecret: clientSecret || '',
        appearance,
        locale: 'pl' as StripeElementLocale
    };

    // useEffect(() => {
    //     if (step === 2 && cartTotal.raw > 0 && shippingMethods) {
    //         const prepareMethods = shippingMethods.map(method => ({ ...method, price: method.freeFrom ? ((cartTotal.raw/100) >= method.freeFrom ? 0 : method.price) : method.price }))
    //         setShippingMethods(prepareMethods)
    //     }
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [cartTotal])

    React.useEffect(() => {
        if (step === 2 && !shippingMethods) {
            fetchData()
        }
    }, [step, shippingMethods])

    return (
        <div className='py-20 max-w-7xl mx-auto flex flex-col gap-6'>
            <h1 className='text-3xl tracking-tight font-semibold mt-10 text-slate-900 mb-6'>{step}. Twój koszyk</h1>
            <div className='flex w-full gap-12'>
                {step === 1 && (
                    <>
                        {!cart || !cart.items || cart?.items?.length === 0 ? (
                            <div className='flex flex-col flex-grow border border-dashed p-5 items-center justify-center rounded-xl backdrop-blur-sm'>
                                <Image src={EmptyCartImage} alt='Pusty koszyk' width={200} />
                                <h1 className='mt-3 text-xl font-semibold tracking-tight'>Twój koszyk jest pusty</h1>
                                <h2 className='mt-1 text-sm text-muted-foreground'>Dodaj jakieś produkty, aby przejść dalej</h2>
                            </div>
                        ) : (
                            <div className='flex flex-col flex-grow divide-y-[1px]'>
                                {cart.items.map((item) => (
                                    <div key={item.id} className='py-6 flex items-center gap-3'>
                                        <Image src={item.product.image?.thumbnailURL || ''} alt={item.product.title} width={130} height={130} className='rounded-lg' />

                                        <div className='grow'>
                                            <h1 className='text-md font-semibold'>{item.product.title}</h1>
                                            <h2 className='text-xs font-medium text-muted-foreground'>Kategorie: {item.product.categories?.map(category => category.title).join(", ")}</h2>

                                            <p className='text-sm font-medium mt-2'>{getPriceFromJSON(item.product.priceJSON)} x {item.quantity} szt.</p>
                                        </div>

                                        <div className='h-full flex items-start justify-end'>
                                            <div onClick={() => deleteItemFromCart(item.product)} className='text-accent-foreground font-semibold cursor-pointer p-3'><Icons.X className='w-4 h-4' /></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
                {step === 2 && (
                    <div className='flex flex-col flex-grow'>
                        <Label className='mb-2'>Wybierz metodę dostawy</Label>
                        <div className='grid grid-cols-2 gap-4'>
                            {shippingMethods?.map(method => (
                                <div key={method.id} className={cn('border rounded-lg p-3 flex items-center gap-3 w-full cursor-pointer bg-slate-50/50 hover:bg-slate-100 transition-colors', method.id === selectedShippingMethod?.id && 'border-slate-900 bg-blue-50/50')} onClick={() => setSelectedShippingMethod(method)}>
                                    <Image src={method.logo.url || ''} alt={method.title} width={55} height={55} className='rounded-lg' />
                                    <div className='flex flex-col flex-grow'>
                                        <h1 className='text-md font-semibold'>{method.title}</h1>
                                        <p className='text-sm text-muted-foreground'>Wysyłka w ciągu {method.deliveryDaysTime} dni</p>
                                    </div>
                                    <div className='flex items-start justify-end h-full'>
                                        <p className='font-semibold mt-2'>{formattedPrice(method.price)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Label className='mb-2 mt-6'>Wybierz metodę płatności</Label>
                        <div className='grid grid-cols-3 gap-3'>
                            <Dialog>
                                <DialogTrigger asChild>
                                    {(paymentMethods?.length || 0) > 0 && (<div 
                                        className={cn('border p-4 rounded-xl flex items-center gap-4 cursor-pointer bg-slate-50/50 hover:bg-slate-100 transition-colors', selectedPaymentType === 'card' && 'border-slate-900 bg-blue-50/50')} 
                                    >
                                        <Image src={
                                            (selectedCardId && paymentMethods) ? ((paymentMethods.find(method => method.id === selectedCardId) as any).card.brand === 'visa' ? VisaLogo : MastercardLogo) : VisaLogo
                                        } alt={'Credit card'} width={50} height={30} />
                                        <div className='leading-5'>
                                            <h1 className='font-semibold'>Karta płatnicza</h1>
                                            <p className='text-xs text-muted-foreground font-medium'>{
                                                (selectedCardId && paymentMethods) ? `Karta ${((paymentMethods.find(method => method.id === selectedCardId) as any).card.brand).toUpperCase()} ....${((paymentMethods.find(method => method.id === selectedCardId) as any).card.last4)}` : 'Wybierz kartę'
                                            
                                            }</p>
                                        </div>
                                    </div>)}
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Wybierz zapisaną kartę</DialogTitle>
                                        <DialogDescription>
                                            Jeśli chcesz dodać lub zmienić kartę, przejdź do ustawień konta.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogClose>
                                        <div className='mt-3 flex flex-col'>
                                            {paymentMethods?.map((method: any) => {
                                                const isExpired = new Date(method.card.exp_year, method.card.exp_month - 1, 1) < new Date()
                                                if (isExpired) return null
                                                return (
                                                    <div 
                                                        key={method.id} 
                                                        className={cn('border py-4 px-3 first:rounded-t-lg last:rounded-b-lg flex items-center gap-4 cursor-pointer bg-slate-50/50 hover:bg-slate-100 transition-colors', selectedCardId === method.id && 'border-slate-900 bg-blue-50/50')}
                                                        onClick={() => { setSelectedPaymentType('card'); setSelectedCardId(method.id) }}
                                                    >
                                                        <Image src={`/assets/cards/${method.card.brand}.png`} alt={method.card.brand} width={50} height={30} />
                                                        <div className='leading-5'>
                                                            <h1 className='font-medium'>{method.card.brand.toUpperCase()} o końcówce ....{method.card.last4}</h1>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </DialogClose>
                                </DialogContent>
                            </Dialog>
                            <div 
                                className={cn('border p-4 rounded-xl flex items-center gap-4 cursor-pointer bg-slate-50/50 hover:bg-slate-100 transition-colors', selectedPaymentType === 'blik' && 'border-slate-900 bg-blue-50/50')} 
                                onClick={() => setSelectedPaymentType('blik')}
                            >
                                <Image src={BlikLogo} alt={'Credit card'} width={50} height={30} />
                                <div className='leading-5'>
                                    <h1 className='font-semibold'>BLIK</h1>
                                    <p className='text-xs text-muted-foreground font-medium'>Szybka płatność kodem</p>
                                </div>
                            </div>
                            <div 
                                className={cn('border p-4 rounded-xl flex items-center gap-4 cursor-pointer bg-slate-50/50 hover:bg-slate-100 transition-colors', selectedPaymentType === 'p24' && 'border-slate-900 bg-blue-50/50')} 
                                onClick={() => setSelectedPaymentType('p24')}
                            >
                                <Image src={Przelewy24Logo} alt={'Credit card'} width={50} height={30} />
                                <div className='leading-5'>
                                    <h1 className='font-semibold'>Przelewy24</h1>
                                    <p className='text-xs text-muted-foreground font-medium'>Najpopularniejsze płatności</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <Elements options={options} stripe={stripePromise}>
                        <PaymentForm
                            cartTotal={cartTotal}
                            selectedShippingMethod={selectedShippingMethod}
                            selectedPaymentType={selectedPaymentType}
                            selectedCardId={selectedCardId}
                            paymentMethods={paymentMethods}
                            requiresAction={requiresAction}
                            clientSecret={clientSecret}
                        />
                    </Elements>
                )}
                
                {step < 3 && (
                    <div className='w-[400px] bg-slate-100 p-4 rounded-xl flex flex-col max-h-min h-min'>
                        <h1 className='font-semibold tracking-tight text-lg'>Podsumowanie zamówienia</h1>

                        <div className='flex flex-col divide-y-[1px]'>
                            <div className='py-3 flex items-center justify-between text-sm'>
                                <p className='text-gray-700'>Cena netto</p>
                                <h1 className='font-semibold'>{formattedPrice((cartTotal.raw - (cartTotal.raw * 0.23))/100)}</h1>
                            </div>
                            <div className='py-3 flex items-center justify-between text-sm'>
                                <p className='text-gray-700'>Podatek</p>
                                <h1 className='font-semibold'>(23%) {formattedPrice(((cartTotal.raw * 0.23))/100)}</h1>
                            </div>
                            <div className='py-3 flex items-center justify-between text-sm'>
                                <p className='text-gray-700'>Dostawa</p>
                                <h1 className='font-semibold'>{selectedShippingMethod ? `(${selectedShippingMethod.title}) ${formattedPrice(selectedShippingMethod.price)}` : 'Brak'}</h1>
                            </div>
                            <div className='py-3 flex items-center justify-between text-sm'>
                                <p className='text-gray-700'>Metoda płatności</p>
                                <h1 className='font-semibold'>{
                                    selectedPaymentType ? (
                                        selectedPaymentType === 'blik' && 'Blik' || 
                                        selectedPaymentType === 'p24' && 'Przelewy24' || 
                                        (
                                            selectedPaymentType === 'card' && paymentMethods
                                        ) && `Karta ${((paymentMethods.find(method => method.id === selectedCardId) as any).card.brand).toUpperCase()}`
                                    ) : 'Brak'}
                                </h1>
                            </div>
                            <div className='py-3 flex items-center justify-between text-sm'>
                                <p className='text-gray-700'>W sumie</p>
                                <h1 className='font-semibold'>{formattedPrice((cartTotal.raw/100) + (selectedShippingMethod?.price || 0))}</h1>
                            </div>

                            {step === 1 && <Button className='mt-3' disabled={!user || cart?.items?.length === 0} onClick={() => setStep(prev => prev + 1)}>Przejdź dalej</Button>}
                            {step === 2 && <Button className='mt-3' disabled={!user || !isStep2Completed || isLoading} onClick={handlePreparePayment}>{isLoading && <Icons.Loader className='w-4 h-4 mr-2 animate-spin' />}{selectedCardId ? `Zapłać (${formattedPrice((cartTotal.raw/100) + (selectedShippingMethod?.price || 0))})` : 'Przejdź do płatności'}</Button>}

                            {step === 2 && !isAddressShippingProvided && (
                                <div className='bg-rose-50 px-4 py-3 mt-3 rounded-lg'>
                                    <p className='font-semibold text-rose-800 text-xs text-center text-balance'>Aby złożyć zamówienie uzupełnij adres dostawy w <Link href={'/konto'}>ustawieniach</Link></p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}