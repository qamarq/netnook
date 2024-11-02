"use server"

import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import { headers } from 'next/headers'
import { ShippingMethod, User } from '@/payload-types'
import { stripe } from '@/lib/stripe'

export const getAllShippingMethodsAndPaymentMethods = async () => {
    const payload = await getPayloadHMR({ config })

    const myHeaders = headers()
    const { user } = await payload.auth({ headers: myHeaders })
    if (!user ) { return { success: false } }
    const currentUser = user as unknown as User

    const shippingMethods = await payload.find({
        collection: 'shipping_methods',
        limit: 50,
    })

    if (!currentUser.stripeCustomerId) {
        return { success: false }
    }

    const paymentMethods = await stripe.customers.listPaymentMethods(currentUser.stripeCustomerId, { limit: 10 })

    return { success: true, shippingMethods: shippingMethods.docs as unknown as ShippingMethod[], paymentMethods: paymentMethods.data }
}