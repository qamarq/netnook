"use client"

import React, { useEffect } from 'react'
import { StripeElementLocale, loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CardFillForm from './_components/CardFillForm';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useAuth } from '@/hooks/Auth';
import { Skeleton } from '@/components/ui/skeleton';
import { format, set } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { deletePaymentMethodFromAccount, getPaymentMethodsFromAccount, setDefaultPaymentMethod } from '@/actions/users';
import { toast } from 'sonner';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Stripe from 'stripe';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || "");

export default function PaymentMethodsPage() {
    const options = {
        locale: 'pl' as StripeElementLocale
    };

    const { user } = useAuth()

    const [paymentMethods, setPaymentMethods] = React.useState<Stripe.Response<Stripe.ApiList<Stripe.PaymentMethod>>["data"] | null>(null)
    const [deleting, setDeleting] = React.useState<string | null>(null)
    const [defaulting, setDefaulting] = React.useState<string | null>(null)
    const [isLoading, startTransition] = React.useTransition()
    const [defaultPayment, setDefaultPayment] = React.useState<string | null>(null)
    const firstTimeRef = React.useRef(true)

    const handleGetPaymentMethods = async () => {
        startTransition(async () => {
            await getPaymentMethodsFromAccount()
                .then(data => {
                    if (data.success && data.paymentMethods) {
                        setPaymentMethods(data.paymentMethods)
                        setDefaultPayment(data.defaultPaymentMethod)
                    } else {
                        toast.error(data.error)
                    }
                })
        })
        
    }

    const handleSetDefaultPaymentMethod = async (id: string) => {
        setDefaulting(id)
        await setDefaultPaymentMethod(id)
            .then(async data => {
                if (data.success) {
                    toast.success('Metoda płatności została ustawiona jako domyślna')
                    setDefaulting(null)
                    setDefaultPayment(id)
                    return
                }
                toast.error(data.error)
                setDefaulting(null)
            })
    }

    useEffect(() => {
        if (firstTimeRef.current) {
            firstTimeRef.current = false
            handleGetPaymentMethods()
            return
        }
    }, [])

    const handleDelete = async (id: string) => {
        setDeleting(id)
        await deletePaymentMethodFromAccount(id)
            .then(async data => {
                if (data.success) {
                    await handleGetPaymentMethods()
                    setDeleting(null)
                    toast.success('Metoda płatności została usunięta')
                    return
                }
                toast.error(data.error)
                setDeleting(null)
            })
    }

    return (
        <div className=''>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">NetNook</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/components">Konto</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Metody płatności</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <h1 className='mt-3 text-3xl font-semibold tracking-tight mb-10'>Metody płatności</h1>

            <main className='grid grid-cols-3 gap-2'>
                {paymentMethods?.map((method: any) => {
                    const isExpired = new Date(method.card.exp_year, method.card.exp_month - 1, 1) < new Date()
                    const isDefault = defaultPayment === method.id
                    return (
                        <div key={method.id} className={cn('border p-4 rounded-xl flex items-center gap-4 relative', { 'border-blue-600 bg-blue-50': isDefault, 'border-rose-600 bg-rose-50': isExpired })}>
                            <Image src={`/assets/cards/${method.card.brand}.png`} alt={method.card.brand} width={50} height={30} />
                            <div className='leading-5'>
                                <h1 className='font-semibold text-sm line-clamp-1'>{method.card.brand.toUpperCase()} {method.card.last4}</h1>
                                <p className='text-xs text-muted-foreground font-medium'>{isExpired ? 'Straciła ważność' : 'Ważna do'}: <span className={cn({'font-semibold text-rose-500': isExpired})}>{format(new Date(2024, method.card.exp_month - 1, 1), 'LLL', { locale: pl })}/{method.card.exp_year}</span></p>
                            </div>
                            <div className='grow flex items-start justify-end gap-1'>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button size={"icon"} variant={"outline"} className='w-8 h-8' disabled={defaulting === method.id || isDefault} onClick={() => handleSetDefaultPaymentMethod(method.id)}>
                                                {defaulting === method.id ? <Icons.Loader className='w-4 h-4 animate-spin' /> : <Icons.Home className='w-4 h-4' />}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {isDefault ? <p>Domyslna metoda płatności</p> : <p>Ustaw kartę ....{method.card.last4} jako domyślną</p>}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button size={"icon"} className='w-8 h-8' disabled={deleting === method.id} onClick={() => handleDelete(method.id)}>
                                                {deleting === method.id ? <Icons.Loader className='w-4 h-4 animate-spin' /> : <Icons.Trash className='w-4 h-4' />}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Usuń kartę ....{method.card.last4}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            {isDefault && <div className='flex items-center justify-center absolute -bottom-2 inset-x-0'><p className='bg-blue-100 shadow-sm text-blue-800 font-semibold py-0.5 px-3 rounded-md text-xs'>DOMYŚLNA</p></div>}
                        </div>
                    )
                })}
                {(!user || isLoading) && (
                    <>
                        <div className='border p-4 rounded-xl flex items-center gap-4'>
                            <Skeleton className='w-[50px] h-[30px] rounded-lg' />
                            <div className='leading-5'>
                                <Skeleton className='w-[160px] h-4 mb-1' />
                                <Skeleton className='w-[120px] h-3' />
                            </div>
                        </div>
                    </>
                )}
                <Elements options={options} stripe={stripePromise}>
                    <CardFillForm handleGetPaymentMethods={handleGetPaymentMethods} />
                </Elements>
            </main>
        </div>
    )
}
