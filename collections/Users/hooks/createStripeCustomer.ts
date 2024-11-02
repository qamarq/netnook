import { CollectionBeforeChangeHook } from 'payload/types';
import { stripe } from '@/lib/stripe';
// import Stripe from 'stripe';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
//     apiVersion: '2024-04-10',
// });

export const createStripeCustomer: CollectionBeforeChangeHook = async ({
    req,
    data,
    operation,
}) => {
    if (operation === 'create' && !data.stripeCustomerId) {
        console.log(operation, data.stripeCustomerId, data.email, data.name, data.id)
        try {
            // lookup an existing customer by email and if found, assign the ID to the user
            // if not found, create a new customer and assign the new ID to the user
            const existingCustomer = await stripe.customers.list({
                limit: 1,
                email: data.email,
            });

            if (existingCustomer.data.length) {
                // existing customer found, assign the ID to the user
                return {
                    ...data,
                    stripeCustomerId: existingCustomer.data[0].id,
                };
            }

            // create a new customer and assign the ID to the user
            const customer = await stripe.customers.create({
                name: data.name,
                email: data.email,
                preferred_locales: ['pl'],
                metadata: {
                    "user_id": data.id,
                }
            });

            return {
                ...data,
                stripeCustomerId: customer.id,
            };
        } catch (error: unknown) {
            req.payload.logger.error(
                `Error creating Stripe customer: ${error}`
            );
        }
    }

    return data;
};
