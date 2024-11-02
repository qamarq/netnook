import { getUserSubscriptionPlan } from '@/actions/subscription'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { stripe } from '@/lib/stripe'
import React from 'react'
import { BillingForm } from './_components/BillingForm'

export default async function NetNookProPage() {
    const subscriptionPlan = await getUserSubscriptionPlan()

    let isCanceled = false
    if (subscriptionPlan.isPro && subscriptionPlan.stripeSubscriptionId) {
        const stripePlan = await stripe.subscriptions.retrieve(
            subscriptionPlan.stripeSubscriptionId
        )
        isCanceled = stripePlan.cancel_at_period_end
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
                        <BreadcrumbLink href="/konto">Konto</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Subskrypcja NetNook Pro</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <h1 className='mt-3 text-3xl font-semibold tracking-tight mb-10'>Subskrypcja NetNook Pro</h1>

            <BillingForm
                subscriptionPlan={{
                    ...subscriptionPlan,
                    isCanceled,
                }}
            />
        </div>
    )
}
