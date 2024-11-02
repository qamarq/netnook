"use server"

import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import { CartItems, Order, ShippingMethod, User } from "@/payload-types"
import { headers } from 'next/headers'

// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
import { stripe } from '@/lib/stripe'
import { getUserSubscriptionPlan, proPlan } from './subscription'
import { revalidatePath } from 'next/cache'

const returnURL = `${process.env.NEXT_PUBLIC_SERVER_URL}/konto/netnookpro`

export const createCheckoutSession = async (products: CartItems, selectedShippingMethod: ShippingMethod) => {
    const payload = await getPayloadHMR({ config })
    const myHeaders = headers()
    const { user } = await payload.auth({ headers: myHeaders })

    if (!user || !products || products.length === 0) {
        return { success: false, error: 'Wystąpił błąd' }
    }

    const currentUser = user as unknown as User

    // try {
    //     const session = await stripe.checkout.sessions.create({
    //         client_reference_id: currentUser.id,
    //         customer: currentUser.stripeCustomerId || undefined,
    //         customer_email: currentUser.stripeCustomerId ? undefined : currentUser.email,
    //         line_items: products.map(item => ({
    //             price: JSON.parse(item.product.priceJSON || "{}").data[0].id,
    //             quantity: item.quantity,
    //             adjustable_quantity: {
    //                 enabled: true,
    //                 minimum: 1,
    //                 maximum: 10,
    //             }
    //         })),
    //         mode: 'payment',
    //         return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/koszyk/planosc`,
    //         allow_promotion_codes: true,
    //         currency: 'PLN',
    //         invoice_creation: {
    //             enabled: true
    //         },
    //         payment_intent_data: {
    //             receipt_email: currentUser.email,
    //             shipping: {
    //                 address: {
    //                     line1: currentUser.groupAddressShipping?.streetLine1 || '',
    //                     line2: currentUser.groupAddressShipping?.streetLine2 || '',
    //                     city: currentUser.groupAddressShipping?.city || '',
    //                     postal_code: currentUser.groupAddressShipping?.zip || '',
    //                     state: currentUser.groupAddressShipping?.state || '',
    //                     country: currentUser.groupAddressShipping?.country || 'PL',
    //                 },
    //                 name: currentUser.groupAddressShipping?.name || '',
    //                 phone: currentUser.groupAddressShipping?.phone || '',
    //             }
    //         },
    //         // payment_method_types: ['card', 'blik', 'p24'],
    //         payment_method_configuration: 'pm_1P7yfgDvHnhVmFB5REi0n7Rb',
    //         saved_payment_method_options: {
    //             allow_redisplay_filters: ['always'],
    //             payment_method_save: 'enabled'
    //         },
    //         shipping_options: [
    //             {
    //                 shipping_rate_data: {
    //                     display_name: selectedShippingMethod.title,
    //                     delivery_estimate: {
    //                         minimum: {
    //                             unit: 'business_day',
    //                             value: selectedShippingMethod.deliveryDaysTime
    //                         },
    //                         maximum: {
    //                             unit: 'business_day',
    //                             value: selectedShippingMethod.deliveryDaysTime + 2
    //                         }
    //                     },
    //                     fixed_amount: {
    //                         amount: Math.round(selectedShippingMethod.price * 100),
    //                         currency: 'PLN'
    //                     },
    //                     tax_behavior: 'exclusive',
    //                     type: 'fixed_amount'
    //                 }
    //             }
    //         ],
    //         submit_type: 'pay',
    //         ui_mode: 'embedded'
    //     })
    
    //     return { success: true, clientSecret: session.client_secret }
    // } catch (error) {
    //     console.error(error)
    //     return { success: false, error: 'Wystąpił błąd' }
    // }
}

export const createPaymentIntent = async (cart: { items: CartItems[] }, cartTotal: { formatted: string; raw: number; }, selectedShippingMethod: ShippingMethod, paymentMethodType: 'blik' | 'card' | 'p24', paymentCardId: string | null) => {
    const payload = await getPayloadHMR({ config })
    const myHeaders = headers()
    const { user } = await payload.auth({ headers: myHeaders })

    if (!user || !cart || cart.items.length === 0 || !cartTotal || !selectedShippingMethod || !paymentMethodType) {
        return { success: false, error: 'Wystąpił błąd' }
    }

    const currentUser = user as unknown as User

    // Verify if user cart from currentUser matches the cart from the request
    const userCart = currentUser.cart
    if (!userCart || userCart === undefined || userCart.items === undefined || userCart.items?.length === 0) {
        return { success: false, error: 'Wystąpił błąd' }
    }

    const userCartItems = userCart.items
    const requestCartItems = cart.items

    if (!userCartItems || !requestCartItems || userCartItems.length !== requestCartItems.length) {
        return { success: false, error: 'Wystąpił błąd' }
    }

    const totalFromUserCart = userCartItems.reduce((acc, item) => acc + (item.quantity * JSON.parse(item.product.priceJSON || "{}").data[0].unit_amount), 0)
    if (totalFromUserCart !== cartTotal.raw) {
        return { success: false, error: 'Wystąpił błąd' }
    }

    if (currentUser.stripeCustomerId === undefined) {
        return { success: false, error: 'Wystąpił błąd' }
    }

    // Check complete

    const order = await payload.create({
        collection: 'orders',
        data: {
            orderedBy: currentUser.id,
            total: cartTotal.raw,
            items: cart.items.map((item: any) => ({
                product: item.product.id,
                price: JSON.parse(item.product.priceJSON || "{}").data[0].unit_amount,
                quantity: item.quantity,
            })),
            shippingMethod: selectedShippingMethod.id
        }
    })

    let stripePaymentIntentID = ''

    const session = await stripe.paymentIntents.create({
        amount: cartTotal.raw + Math.round(selectedShippingMethod.price * 100),
        currency: 'pln',
        customer: currentUser.stripeCustomerId || undefined,
        receipt_email: currentUser.email,
        payment_method_types: [paymentMethodType],
        payment_method: paymentCardId || undefined,
        confirm: paymentCardId ? true : false,
        description: 'Dziękujemy za zamówienie!',
        // metadata: {
        //     cartItems: JSON.stringify(cart.items),
        //     shippingMethod: JSON.stringify(selectedShippingMethod)
        // },
        metadata: {
            orderID: order.id
        },
        return_url: paymentCardId ? `${process.env.NEXT_PUBLIC_SERVER_URL}/koszyk/platnosc` : undefined,
        shipping: {
            address: {
                line1: currentUser.groupAddressShipping?.streetLine1 || '',
                line2: currentUser.groupAddressShipping?.streetLine2 || '',
                city: currentUser.groupAddressShipping?.city || '',
                postal_code: currentUser.groupAddressShipping?.zip || '',
                state: currentUser.groupAddressShipping?.state || '',
                country: currentUser.groupAddressShipping?.country || 'PL',
            },
            name: currentUser.groupAddressShipping?.name || '',
            phone: currentUser.groupAddressShipping?.phone || '',
            carrier: selectedShippingMethod.title,
        }
    })

    stripePaymentIntentID = session.id

    await payload.update({
        collection: 'orders',
        id: order.id,
        data: {
            stripePaymentIntentID
        }
    })

    return { success: true, status: session.status, clientSecret: session.client_secret, paymentId: session.id }
}

export const getOrderByStripePaymentIntentID = async (stripePaymentIntentID: string) => {
    const payload = await getPayloadHMR({ config })
    const myHeaders = headers()
    const { user } = await payload.auth({ headers: myHeaders })

    if (!user) {
        return { success: false, error: 'Wystąpił błąd' }
    }

    const orders = await payload.find({
        collection: 'orders',
        where: {
            stripePaymentIntentID: {
                equals: stripePaymentIntentID
            }
        }
    })

    if (orders.docs.length === 0) {
        return { success: false, error: 'Wystąpił błąd' }
    }

    const paymentIntent = JSON.stringify(await stripe.paymentIntents.retrieve(stripePaymentIntentID))

    return { success: true, order: orders.docs[0] as unknown as Order, paymentIntent: JSON.parse(paymentIntent) }
}

export const getOrderByID = async (id: string) => {
    const payload = await getPayloadHMR({ config })
    const myHeaders = headers()
    const { user } = await payload.auth({ headers: myHeaders })

    if (!user) {
        return { success: false, error: 'Wystąpił błąd' }
    }

    const order = await payload.findByID({
        collection: 'orders',
        id
    }) as unknown as Order

    if (!order) {
        return { success: false, error: 'Wystąpił błąd' }
    }

    const paymentIntent = JSON.stringify(await stripe.paymentIntents.retrieve(order.stripePaymentIntentID || ''))

    return { success: true, order: order as unknown as Order, paymentIntent: JSON.parse(paymentIntent) }
}

export const getStripeSubscriptionSession = async () => {
    try {
        const payload = await getPayloadHMR({ config })
        const myHeaders = headers()
        const { user } = await payload.auth({ headers: myHeaders })

        if (!user) {
            return { success: false, error: 'Wystąpił błąd' }
        }

        const currentUser = user as unknown as User
    
        const subscriptionPlan = await getUserSubscriptionPlan()
    
        // The user is on the pro plan.
        // Create a portal session to manage subscription.
        if (subscriptionPlan.isPro && subscriptionPlan.stripeCustomerId) {
            const stripeSession = await stripe.billingPortal.sessions.create({
                customer: subscriptionPlan.stripeCustomerId,
                return_url: returnURL,
            })
        
            return { success: true, url: stripeSession.url }
        }
    
        // The user is on the free plan.
        // Create a checkout session to upgrade.
        const stripeSession = await stripe.checkout.sessions.create({
            return_url: returnURL,
            payment_method_types: ["card"],
            mode: "subscription",
            payment_method_collection: 'if_required',
            customer: currentUser.stripeCustomerId || undefined,
            line_items: [
                {
                    price: proPlan.stripePriceId,
                    quantity: 1,
                },
            ],
            metadata: {
                userId: currentUser.id,
            },
            ui_mode: 'embedded',
            consent_collection: {
                terms_of_service: 'required',
            },
            custom_text: {
                terms_of_service_acceptance: {
                    message: 'Wyrażam zgodę na [warunki korzystania z usług](https://example.com/terms)',
                },
            },
            redirect_on_completion: 'if_required',
            // @ts-ignore
            saved_payment_method_options: {
                allow_redisplay_filters: ['always'],
                payment_method_save: 'enabled',
            },
        })
    
        return { success: true, clientSecret: stripeSession.client_secret }
    } catch (error) {
        console.log(error)
        return { success: false, error: 'Wystąpił błąd' }
    }
}

export const getStripeSetupSession = async () => {
    try {
        const payload = await getPayloadHMR({ config })
        const myHeaders = headers()
        const { user } = await payload.auth({ headers: myHeaders })

        if (!user) {
            return { success: false, error: 'Wystąpił błąd' }
        }

        const currentUser = user as unknown as User
        if (!currentUser.stripeCustomerId) {
            return { success: false, error: 'Wystąpił błąd' }
        }
    
        // The user is on the free plan.
        // Create a checkout session to upgrade.
        const stripeSession = await stripe.checkout.sessions.create({
            return_url: returnURL,
            payment_method_types: ["card"],
            mode: "setup",
            customer: currentUser.stripeCustomerId,
            metadata: {
                userId: currentUser.id,
            },
            ui_mode: 'embedded',
            consent_collection: {
                terms_of_service: 'required',
            },
            custom_text: {
                terms_of_service_acceptance: {
                    message: 'Wyrażam zgodę na [warunki korzystania z usług](https://example.com/terms)',
                },
            },
            redirect_on_completion: 'if_required',
            // // @ts-ignore
            // saved_payment_method_options: {
            //     allow_redisplay_filters: ['always'],
            //     payment_method_save: 'enabled',
            // },
        })
    
        return { success: true, clientSecret: stripeSession.client_secret }
    } catch (error) {
        console.log(error)
        return { success: false, error: 'Wystąpił błąd' }
    }
}

export const cancelCheckoutSession = async (clientSecret: string) => {
    const paymentSessionId = clientSecret.split('_secret')[0]
    await stripe.checkout.sessions.expire(paymentSessionId)
}

export const getSubscriptionStatus = async () => {
    try {
        const payload = await getPayloadHMR({ config })
        const myHeaders = headers()
        const { user } = await payload.auth({ headers: myHeaders })

        if (!user) {
            return { success: false, error: 'Wystąpił błąd' }
        }

        const currentUser = user as unknown as User

        const subscription = await stripe.subscriptions.retrieve(currentUser.stripeSubscriptionId || '')

        if (subscription.status === 'active') {
            revalidatePath('/konto/netnookpro')
        }

        return { success: true, subscription }
    } catch (error) {
        console.log(error)
        return { success: false, error: 'Wystąpił błąd' }
    }
}

export const getSubscriptionInvoices = async () => {
    try {
        const payload = await getPayloadHMR({ config })
        const myHeaders = headers()
        const { user } = await payload.auth({ headers: myHeaders })

        if (!user) {
            return { success: false, error: 'Wystąpił błąd' }
        }

        const currentUser = user as unknown as User
        if (!currentUser.stripeCustomerId) {
            return { success: false, error: 'Wystąpił błąd' }
        }
        
        const list = await stripe.paymentIntents.list({
            customer: currentUser.stripeCustomerId,
            limit: 100
        })

        const preparedPaymentList = list.data.filter(sub => sub.invoice !== null)
        const invoices = await Promise.all(preparedPaymentList.map(async payment => {
            return await stripe.invoices.retrieve(payment.invoice as string)
        }))

        const preparedInvoices = JSON.parse(JSON.stringify(invoices))

        return { success: true, invoices: preparedInvoices }
    } catch (error) {
        console.log(error)
        return { success: false, error: 'Wystąpił błąd' }
    }
}