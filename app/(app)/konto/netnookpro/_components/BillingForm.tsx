'use client';

import * as React from 'react';

import { cn, formatDate, formattedPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { UserSubscriptionPlan } from '@/payload-types';
import { toast } from 'sonner';
import { cancelCheckoutSession, getStripeSubscriptionSession, getSubscriptionInvoices, getSubscriptionStatus } from '@/actions/payments';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { stripeInvoiceStatuses } from '@/constants';
import Link from 'next/link';

interface BillingFormProps extends React.HTMLAttributes<HTMLFormElement> {
    subscriptionPlan: UserSubscriptionPlan & {
        isCanceled: boolean;
    };
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

export function BillingForm({
    subscriptionPlan,
}: BillingFormProps) {
    const [isLoading, setIsLoading] = React.useState(false)
    const [opened, setOpened] = React.useState(false)
    const [isComplete, setIsComplete] = React.useState(false);
    const [invoices, setInvoices] = React.useState<Stripe.Invoice[] | null>(null)
    const [isLoadingInvoices, setIsLoadingInvoices] = React.useState(false)
    const [options, setOptions] = React.useState<{
        clientSecret?: string | null;
        fetchClientSecret?: (() => Promise<string>) | null;
        onComplete?: () => void;
    } | null>(null)
    const firstTimeRef = React.useRef(true)

    const checkSubscriptionStatus = async () => {
        await getSubscriptionStatus()
            .then(data => {
                if (data.success && data.subscription) {
                    if (data.subscription.status === 'active') {
                        setIsLoading(false)
                    } else {
                        handleComplete()
                    }
                } else {
                    handleComplete()
                }
            })
    }

    const getAllInvoices = async () => {
        setIsLoadingInvoices(true)
        await getSubscriptionInvoices()
            .then(data => {
                if (data.success && data.invoices) {
                    setInvoices(data.invoices)
                }
            })
            .finally(() => {
                setIsLoadingInvoices(false)
            })
    }

    const handleComplete = () => {
        setIsComplete(true)

        setTimeout(() => {
            checkSubscriptionStatus()
            getAllInvoices()
        }, 1000)   
    };

    const handleBtnAction = async () => {
        setIsLoading(true)
        await getStripeSubscriptionSession()
            .then(data => {
                if (data.success) {
                    if (data.url) {
                        window.location.href = data.url
                        setIsLoading(false)
                    } else if (data.clientSecret) {
                        setOptions({ clientSecret: data.clientSecret, onComplete: () => {handleComplete()}})
                        setOpened(true)
                    }
                } else {
                    toast.error('Something went wrong', {
                        description: data.error
                    })
                    setIsLoading(false)
                }
            })
    }

    const handleOpenChange = async (state: boolean) => {
        setOpened(state); 
        setIsLoading(state)
        if (state === false && !isComplete && options && options.clientSecret) {
            await cancelCheckoutSession(options.clientSecret)
        }
    }

    React.useEffect(() => {
        if (firstTimeRef.current) {
            firstTimeRef.current = false
            getAllInvoices()
            return
        }
    }, [])

    return (
        <>
            <Dialog open={opened} onOpenChange={(state) => handleOpenChange(state)}>
                <DialogContent className="sm:max-w-[435px] max-h-[calc(100dvh-15px)] overflow-auto p-4">
                    <div className='my-2 mx-1'>
                        {options && (
                            <>
                                {isComplete ? (
                                    <div className='w-full min-h-[400px] flex items-center justify-center flex-col text-center text-balance'>
                                        {isLoading ? <Icons.Loader className='h-20 w-20 animate-spin text-primary' /> : <Icons.CircleCheck className='h-20 w-20 text-emerald-500' />}
                                        <h2 className='text-xl font-semibold mt-6'>Dziękujemy za zakup planu NetNookPRO!</h2>
                                        <p className='text-sm text-muted-foreground mt-2'>{isLoading ? 'Prosimy o chwilę cierpliwości. Trwa weryfikacja Twojego zakupu...' : 'Wszystko zweryfikowano pomyślnie. Dziękujemy za zaufania i życzymy przyjemnych zakupów!'}</p>

                                        <Button className='mt-10 w-full max-w-[250px]' disabled={isLoading} onClick={() => setOpened(false)}>Wróć do swojej subskrypcji</Button>
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
                    </div>
                </DialogContent>
            </Dialog>
            <Card>
                <CardHeader>
                    <CardTitle>Status subskrypcji</CardTitle>
                    <CardDescription>
                        Posiadasz aktualnie plan{' '}
                        <strong>{subscriptionPlan.name}</strong>.
                    </CardDescription>
                </CardHeader>
                <CardContent>{subscriptionPlan.description}</CardContent>
                <CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0">
                    <Button
                        disabled={isLoading}
                        onClick={handleBtnAction}>
                        {isLoading && (
                            <Icons.Loader className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {subscriptionPlan.isPro
                            ? 'Zarządzaj subskrypcją'
                            : 'Ulepsz do planu PRO'}
                    </Button>
                    {subscriptionPlan.isPro ? (
                        <p className="rounded-full text-xs font-medium">
                            {subscriptionPlan.isCanceled
                                ? 'Twój plan wygaśnie '
                                : 'Twój plan odnowi się '}
                            {formatDate(
                                subscriptionPlan.stripeCurrentPeriodEnd
                            )}
                            .
                        </p>
                    ) : null}
                </CardFooter>
            </Card>

            <Card className='mt-3'>
                <CardHeader>
                    <CardTitle>Twoje faktury</CardTitle>
                    <CardDescription>
                        Lista ostatnich faktur za <strong>Subskrypcje NetNook Pro</strong>.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='flex flex-col gap-4'>
                        {(invoices && invoices.length > 0) ? invoices.map((invoice) => {
                            const isCanceled = invoice.status === 'uncollectible' || invoice.status === 'deleted' || (invoice.status === 'open' && invoice.attempt_count === 9)
                            return (
                                <div className='flex items-center justify-between' key={invoice.id}>
                                    <div className='flex justify-center flex-col'>
                                        <h1 className='text-md font-semibold'>{invoice.lines.data[0].description?.slice(4).split('(at ')[0]}<span className='font-medium'> - {formattedPrice(invoice.total/100)}</span></h1>
                                        <div className='flex items-center'>
                                            <h2 className='text-sm text-muted-foreground'>{format(new Date(invoice.created*1000), "dd MMM yyyy", { locale: pl })}</h2> 
                                            <div className={cn('ml-2 font-semibold text-xs py-1 px-3 rounded-md', {
                                                'text-emerald-800 bg-emerald-100': invoice.status === 'paid',
                                                'text-yellow-800 bg-yellow-100': invoice.status === 'open',
                                                'text-rose-800 bg-rose-100': isCanceled,
                                                'text-blue-800 bg-blue-100': invoice.status === 'draft'
                                            })}>{isCanceled ? stripeInvoiceStatuses['deleted'] : stripeInvoiceStatuses[invoice.status || 'draft']} {!isCanceled && invoice.status !== 'paid' && invoice.attempt_count > 0 && invoice.attempt_count < 9 && ` - Próbowano pobrać środki ${invoice.attempt_count} ${invoice.attempt_count == 1 ? 'raz' : 'razy'}`}</div>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <Link href={invoice.hosted_invoice_url || ''} target='_blank' className={cn({ 'pointer-events-none': isCanceled })}><Button disabled={isCanceled} size={"sm"} variant={"outline"}><Icons.OpenLink className='w-4 h-4 mr-1' /> Zobacz szczegóły</Button></Link>
                                        <Link href={invoice.invoice_pdf || ''} className={cn({ 'pointer-events-none': isCanceled })}><Button size={"sm"} disabled={isCanceled}><Icons.PDF className='w-4 h-4 mr-1' /> Pobierz PDF</Button></Link>
                                    </div>
                                </div>  
                            )
                        }) : (
                            <>
                                {isLoadingInvoices ? (
                                    <div className='flex items-center gap-2'>
                                        <Icons.Loader className='h-4 w-4 animate-spin text-primary' />
                                        <p className='text-muted-foreground'>Ładowanie Twoich faktur...</p>
                                    </div>
                                ) : (
                                    <p className='text-muted-foreground'>Brak faktur do wyświetlenia.</p>
                                )}
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
