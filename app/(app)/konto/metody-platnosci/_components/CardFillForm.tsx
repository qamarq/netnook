"use client"

import { useElements, useStripe, CardElement, EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { type StripeCardElementChangeEvent } from '@stripe/stripe-js';
import React, { useEffect, useMemo, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { addPaymentMethodToAccount } from '@/actions/users';
import { useAuth } from '@/hooks/Auth';
import { cn } from '@/lib/utils';
import { getStripeSetupSession } from '@/actions/payments';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

export default function CardFillForm({ handleGetPaymentMethods }: { handleGetPaymentMethods: () => Promise<void> }) {
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = React.useState('')
    const [isComplete, setIsComplete] = React.useState(false)
    const cardElement = elements?.getElement(CardElement)
    const [openedDialog, setOpenedDialog] = React.useState(false)
    const [options, setOptions] = React.useState<{
        clientSecret?: string | null;
        fetchClientSecret?: (() => Promise<string>) | null;
        onComplete?: () => void;
    } | null>(null)

    // const handleCardChange = (e: StripeCardElementChangeEvent) => {
    //     if (e.complete) {
    //         setCardReady(true)
    //     } else {
    //         setCardReady(false)
    //     }
    // }

    // useEffect(() => {
    //     if (!user) return;
    //     setName(user.name || '')
    // }, [user])

    // const isReady = useMemo(() => {
    //     return cardReady && name.length > 3
    // }, [name, cardReady])

    // const handleAddCard = async () => {
    //     if (!stripe || !elements || !isReady || !cardElement) return;

    //     setIsLoading(true)
    //     try {
    //         await stripe
    //             .createPaymentMethod({
    //                 type: 'card',
    //                 card: cardElement,
    //                 billing_details: {
    //                     name,
    //                 },
    //             })
    //             .then(async function(result) {
    //                 if (result.error) {
    //                     toast.error(result.error.message)
    //                 } else {
    //                     await addPaymentMethodToAccount(result.paymentMethod.id)
    //                         .then(async data => {
    //                             if (data.success) {
    //                                 toast.success('Dodano nową metodę płatności')
    //                                 await handleGetPaymentMethods()
    //                                 setOpenedDialog(false)
    //                             } else {
    //                                 toast.error(data.error)
    //                             }
    //                         })
    //                 }
    //             });
    //     } catch (error) {
    //         toast.error('Podczas dodawania metody płatności wystąpił błąd')
    //     } finally {
    //         setIsLoading(false)
    //     }
    // }

    const handleComplete = async () => {
        setIsComplete(true)
        await handleGetPaymentMethods()
        setIsLoading(false)
    }

    const handleAddCard = async () => {
        setIsLoading(true)

        await getStripeSetupSession()
            .then(data => {
                if (data.success) {
                    if (data.clientSecret) {
                        setOptions({ clientSecret: data.clientSecret, onComplete: () => {handleComplete()}})
                        setOpenedDialog(true)
                    } else {
                        toast.error('Something went wrong', {
                            description: data.error
                        })
                        setIsLoading(false)
                    }
                } else {
                    toast.error(data.error)
                    setIsLoading(false)
                }
            })
    }
    
    return (
        <>
            <div className={cn('h-[70px] border p-4 rounded-xl flex items-center gap-4 justify-center cursor-pointer border-dashed bg-slate-50 hover:bg-slate-100 transition-all', !user && 'bg-slate-100 pointer-events-none')} onClick={handleAddCard}>
                <Icons.PlusCircle className='w-6 h-6 text-slate-500' />
            </div>
            <Dialog open={openedDialog} onOpenChange={setOpenedDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className='text-xl'>Dodaj nową metodę płatności</DialogTitle>
                        <DialogDescription className='flex items-center'>
                            <Icons.Shield className='w-4 h-4 min-w-4' />
                            <span className='ml-2 text-xs'>Twoje dane przechowywane są bezpiecznie dzięki <strong>Stripe</strong>.</span>
                        </DialogDescription>
                    </DialogHeader>
                    {/* <div className='mt-5 space-y-3'>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="name" className="text-left">
                                Imię i nazwisko posiadacza
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder='Imię i nazwisko'
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid gap-4 py-4 border rounded-xl p-3">
                            <CardElement onChange={handleCardChange} options={{ hidePostalCode: true, disableLink: true }} />
                        </div>
                    </div> */}
                    {options && (
                        <>
                            {isComplete ? (
                                <div className='w-full min-h-[400px] flex items-center justify-center flex-col text-center text-balance'>
                                    {isLoading ? <Icons.Loader className='h-20 w-20 animate-spin text-primary' /> : <Icons.CircleCheck className='h-20 w-20 text-emerald-500' />}
                                    {/* <h2 className='text-xl font-semibold mt-6'>Nowa metoda płatności na NetNook!</h2> */}
                                    <p className='text-sm text-muted-foreground mt-8'>{isLoading ? 'Prosimy o chwilę cierpliwości. Trwa weryfikacja Twojej karty...' : 'Wszystko zweryfikowano pomyślnie. Dziękujemy za zaufania i życzymy przyjemnych zakupów!'}</p>

                                    <Button className='mt-10 w-full max-w-[250px]' disabled={isLoading} onClick={() => setOpenedDialog(false)}>Zamknij to okno</Button>
                                </div>
                            ) : (
                                <EmbeddedCheckoutProvider
                                    stripe={stripePromise}
                                    options={options}
                                >
                                    <EmbeddedCheckout className='rounded-lg' />
                                </EmbeddedCheckoutProvider>
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
