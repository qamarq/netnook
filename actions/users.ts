"use server"

import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import { headers } from 'next/headers'
import { User } from '@/payload-types'
import { type StripeAddressElementChangeEvent } from '@stripe/stripe-js'
import { stripe } from '@/lib/stripe'
import { revalidatePath } from 'next/cache'

export const addPaymentMethodToAccount = async (paymentMethodId: string) => {
    const payload = await getPayloadHMR({ config })
    const myHeaders = headers()
    const { user } = await payload.auth({ headers: myHeaders })

    if (!user) {
        return { success: false, error: 'Nie jesteś zalogowany' }
    }

    const currentUser: User = user as unknown as User;

    if (!currentUser.stripeCustomerId) {
        return { success: false, error: 'Nie znaleziono użytkownika Stripe' }
    }

    try {
        const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)

        if (!paymentMethod || !paymentMethod.card) {
            return { success: false, error: 'Nie znaleziono metody płatności' }
        }

        const paymentMethodData = {
            id: paymentMethod.id,
            type: paymentMethod.type,
            card: {
                brand: paymentMethod.card.brand,
                last4: paymentMethod.card.last4,
                exp_month: paymentMethod.card.exp_month,
                exp_year: paymentMethod.card.exp_year,
            },
        }

        // const res = await payload.update({
        //     collection: 'users',
        //     id: currentUser.id,
        //     data: {
        //         paymentMethods: [...currentUser.paymentMethods || [], paymentMethodData],
        //     },
        // })

        await stripe.paymentMethods.attach(
            paymentMethodData.id,
            { customer: currentUser.stripeCustomerId, }
        );

        await stripe.customers.update(
            currentUser.stripeCustomerId,
            {
                invoice_settings: {
                    default_payment_method: paymentMethodData.id,
                }
            }
        )

        revalidatePath('/konto/metody-platnosci')

        return { success: true }
    } catch (error) {
        console.log(error)
        return { success: false, error: 'Podczas dodawania metody płatności wystąpił błąd' }
    }
}

export const setDefaultPaymentMethod = async (paymentMethodId: string) => {
    const payload = await getPayloadHMR({ config })
    const myHeaders = headers()
    const { user } = await payload.auth({ headers: myHeaders })

    if (!user) {
        return { success: false, error: 'Nie jesteś zalogowany' }
    }

    const currentUser: User = user as unknown as User;

    if (!currentUser.stripeCustomerId) {
        return { success: false, error: 'Nie znaleziono użytkownika Stripe' }
    }

    try {
        await stripe.customers.update(
            currentUser.stripeCustomerId,
            {
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                }
            }
        )

        return { success: true }
    } catch (error) {
        console.log(error)
        return { success: false, error: 'Podczas ustawiania domyślnej metody płatności wystąpił błąd' }
    }
}

export const getPaymentMethodsFromAccount = async () => {
    const payload = await getPayloadHMR({ config })
    const myHeaders = headers()
    const { user } = await payload.auth({ headers: myHeaders })

    if (!user) {
        return { success: false, error: 'Nie jesteś zalogowany' }
    }

    const currentUser: User = user as unknown as User;

    try {
        // const paymentMethods = await Promise.all(currentUser.paymentMethods.map(async (method) => {
        //     return {
        //         ...method,
        //         card: {
        //             ...method.card,
        //             brand: method.card.brand,
        //         },
        //     }
        // })

        const paymentMethods = await stripe.paymentMethods.list({
            customer: currentUser.stripeCustomerId || '',
            type: 'card',
        })

        const stripeCustomer = (await stripe.customers.retrieve(currentUser.stripeCustomerId || '')) as any

        return { success: true, paymentMethods: paymentMethods.data, defaultPaymentMethod: stripeCustomer.invoice_settings.default_payment_method as string | null }
    } catch (error) {
        console.log(error)
        return { success: false, error: 'Podczas pobierania metod płatności wystąpił błąd' }
    }

}

export const deletePaymentMethodFromAccount = async (paymentMethodId: string) => {
    const payload = await getPayloadHMR({ config })
    const myHeaders = headers()
    const { user } = await payload.auth({ headers: myHeaders })

    if (!user) {
        return { success: false, error: 'Nie jesteś zalogowany' }
    }

    // const currentUser: User = user as unknown as User;

    // const paymentMethod = currentUser.paymentMethods?.find((method) => method.id === paymentMethodId)

    // if (!paymentMethod) {
    //     return { success: false, error: 'Nie znaleziono metody płatności' }
    // }

    try {
        // const res = await payload.update({
        //     collection: 'users',
        //     id: currentUser.id,
        //     data: {
        //         paymentMethods: currentUser.paymentMethods?.filter((method) => method.id !== paymentMethodId),
        //     },
        // })

        await stripe.paymentMethods.detach(paymentMethodId)

        revalidatePath('/konto/metody-platnosci')

        return { success: true }
    } catch (error) {
        console.log(error)
        return { success: false, error: 'Podczas usuwania metody płatności wystąpił błąd' }
    }
}

export const updateAddressBilling = async (address: StripeAddressElementChangeEvent) => {
    if (typeof address !== 'object' || address === null || !address.complete) {
        return { success: false, error: 'Niepoprawny adres' }
    }

    const payload = await getPayloadHMR({ config })
    const myHeaders = headers()
    const { user } = await payload.auth({ headers: myHeaders })

    if (!user) {
        return { success: false, error: 'Nie jesteś zalogowany' }
    }

    const currentUser: User = user as unknown as User;

    try {
        const res = await payload.update({
            collection: 'users',
            id: currentUser.id,
            data: {
                groupAddress: {
                    streetLine1: address.value.address.line1,
                    streetLine2: address.value.address.line2,
                    city: address.value.address.city,
                    state: address.value.address.state,
                    zip: address.value.address.postal_code,
                    country: address.value.address.country,
                },
                phone: address.value.phone,
                name: address.value.name,
            },
        })

        // if (currentUser.stripeCustomerId) {
        //     await stripe.customers.update(
        //         currentUser.stripeCustomerId,
        //         {
        //             address: {
        //                 line1: address.value.address.line1,
        //                 line2: address.value.address.line2 || '',
        //                 city: address.value.address.city,
        //                 state: address.value.address.state,
        //                 postal_code: address.value.address.postal_code,
        //                 country: address.value.address.country,
        //             }
        //         }
        //     )
        // }

        return { success: true, user: res }
    } catch (error) {
        console.log(error)
        return { success: false, error: 'Podczas aktualizacji adresu wystąpił błąd' }
    }
}

export const updateAddressShipping = async (address: StripeAddressElementChangeEvent) => {
    if (typeof address !== 'object' || address === null || !address.complete) {
        return { success: false, error: 'Niepoprawny adres' }
    }

    const payload = await getPayloadHMR({ config })
    const myHeaders = headers()
    const { user } = await payload.auth({ headers: myHeaders })

    if (!user) {
        return { success: false, error: 'Nie jesteś zalogowany' }
    }

    const currentUser: User = user as unknown as User;

    try {
        const res = await payload.update({
            collection: 'users',
            id: currentUser.id,
            data: {
                groupAddressShipping: {
                    phone: address.value.phone,
                    name: address.value.name,
                    streetLine1: address.value.address.line1,
                    streetLine2: address.value.address.line2,
                    city: address.value.address.city,
                    state: address.value.address.state,
                    zip: address.value.address.postal_code,
                    country: address.value.address.country,
                },
            },
        })

        // if (currentUser.stripeCustomerId) {
        //     await stripe.customers.update(
        //         currentUser.stripeCustomerId,
        //         {
        //             shipping: {
        //                 address: {
        //                     line1: address.value.address.line1,
        //                     line2: address.value.address.line2 || '',
        //                     city: address.value.address.city,
        //                     state: address.value.address.state,
        //                     postal_code: address.value.address.postal_code,
        //                     country: address.value.address.country,
        //                 },
        //                 name: address.value.name,
        //                 phone: address.value.phone,
        //             }
        //         }
        //     )
        // }

        return { success: true, user: res }
    } catch (error) {
        console.log(error)
        return { success: false, error: 'Podczas aktualizacji adresu dostawy wystąpił błąd' }
    }
}