"use client"

import React from 'react'

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { StripeElementLocale, loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import AddressFillForm from './_components/AddressFillForm';
import ShippingAddressFillForm from './_components/ShippingAddressFillForm';
import { Accordion } from '@/components/ui/accordion';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || "");

export default function MainAccountPage() {
    const options = {
        locale: 'pl' as StripeElementLocale
    };

    return (
        <div className=''>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">NetNook</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Konto</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <h1 className='mt-3 text-3xl font-semibold tracking-tight mb-10'>Edytuj profil</h1>

            <main className='flex flex-col gap-2'>
                <Accordion type="single" collapsible className="w-full space-y-2" defaultValue='item-1'>
                    <Elements options={options} stripe={stripePromise}>
                        <AddressFillForm />
                    </Elements>

                    <Elements options={options} stripe={stripePromise}>
                        <ShippingAddressFillForm />
                    </Elements>
                </Accordion>
            </main>
        </div>
    )
}
