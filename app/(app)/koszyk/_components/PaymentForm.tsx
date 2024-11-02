"use client"

import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/Auth'
import { formattedPrice } from '@/lib/utils'
import { AddressElement, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import React, { useMemo } from 'react'
import { toast } from 'sonner'

interface Props {
    cartTotal: any;
    selectedShippingMethod: any;
    selectedPaymentType: any;
    selectedCardId: any;
    paymentMethods: any;
    requiresAction: boolean;
    clientSecret: string | null;
}

export default function PaymentForm({ cartTotal, selectedShippingMethod, selectedPaymentType, selectedCardId, paymentMethods, requiresAction, clientSecret }: Props) {
    const [isLoading, startTransition] = React.useTransition()
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useAuth()
    
    const isReady = useMemo(() => {
        return !!stripe && !!elements
    }, [elements, stripe])

    const handlePay = async () => {
        if (!stripe || !elements) {
            return toast.error('Nie można zainicjować płatności')
        }

        startTransition(async () => {
            // Make sure to change this to your payment completion page
            if (!requiresAction) {
                const { error } = await stripe.confirmPayment({
                    elements,
                    confirmParams: {
                        return_url: window.location.origin + "/koszyk/podsumowanie",
                    },
                });

                if (error) {
                    toast.error(error.message)
                }
            } else if (requiresAction && clientSecret) {
                await stripe.confirmCardPayment(clientSecret, { return_url: window.location.origin + "/koszyk/podsumowanie" })
                    .then(result => {
                        if (result.error) {
                            toast.error(result.error.message)
                        }

                        if (result.paymentIntent?.status === 'succeeded') {
                            window.location.href = `${window.location.origin}/koszyk/podsumowanie?payment_intent=${result.paymentIntent.id}&payment_intent_client_secret=${clientSecret}`
                        }
                    });
            }
        });
    }

    return (
        <>
            <div className='flex flex-col flex-grow'>
                {user && !requiresAction && (
                    <div className='border border-dashed px-5 py-7 rounded-lg'>
                        {/* <h1 className='font-semibold text-lg tracking-tight mb-3'>Adres dostawy</h1>

                        <AddressElement options={{
                            mode: 'shipping',
                            allowedCountries: ['PL'],
                            fields: { phone: 'always' },
                            validation: { phone: { required: 'always' } },
                            display: { name: 'full' },
                            defaultValues: {
                                name: user?.groupAddressShipping?.name,
                                address: {
                                    line1: user?.groupAddressShipping?.streetLine1,
                                    line2: user?.groupAddressShipping?.streetLine2,
                                    city: user?.groupAddressShipping?.city,
                                    state: user?.groupAddressShipping?.state,
                                    postal_code: user?.groupAddressShipping?.zip,
                                    country: user?.groupAddressShipping?.country || 'PL',
                                },
                                phone: user?.groupAddressShipping?.phone,
                            },
                            autocomplete: {
                                mode: 'google_maps_api',
                                apiKey: process.env.NEXT_PUBLIC_GMAPS_API!,
                            }
                        }} /> */}

                        <h1 className='font-semibold text-xl tracking-tight mb-3'>Wprowadź dane płatności</h1>

                        <PaymentElement 
                            options = {
                                {
                                    defaultValues: {
                                        billingDetails: {
                                            name: user?.name || "",
                                            email: user?.email || "",
                                            phone: user?.phone || "",
                                        }
                                    },
                                    layout: {
                                        type: 'tabs',
                                        defaultCollapsed: false,
                                        radios: false,
                                        spacedAccordionItems: true
                                    }
                                }
                            }
                        />
                    </div>
                )}
                {requiresAction && (
                    <div className='w-full flex items-center justify-center flex-col'>
                        <div className='w-[90px] h-[90px] bg-slate-100 text-slate-800 flex items-center justify-center rounded-full'><Icons.Fingerprint className='w-[44px] h-[44px]' /></div>
                        <h1 className='mt-5 font-semibold tracking-tight text-3xl'>Weryfikacja 3D Secure</h1>
                        <h2 className='max-w-[400px] text-center mt-2 text-lg text-muted-foreground'>Już prawie sukces! Aby dokończyć proces płatności, kliknij przycisk Potwierdź płatność i zweryfikuj ją w aplikacji swojego banku.</h2>
                    </div>
                )}
            </div>

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
                                ) && `Karta ${((paymentMethods.find((method: any) => method.id === selectedCardId) as any).card.brand).toUpperCase()}`
                            ) : 'Brak'}
                        </h1>
                    </div>
                    <div className='py-3 flex items-center justify-between text-sm'>
                        <p className='text-gray-700'>W sumie</p>
                        <h1 className='font-semibold'>{formattedPrice((cartTotal.raw/100) + (selectedShippingMethod?.price || 0))}</h1>
                    </div>

                    <Button className='mt-3' disabled={!isReady || isLoading} onClick={handlePay}>{isLoading && <Icons.Loader className='w-4 h-4 mr-2 animate-spin' />}{requiresAction ? 'Potwierdź płatność' : 'Zapłać'} ({formattedPrice((cartTotal.raw/100) + (selectedShippingMethod?.price || 0))})</Button>
                </div>
            </div>
        </>
    )
}
