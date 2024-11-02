import { stripe } from '@/lib/stripe';
import { CollectionBeforeChangeHook } from 'payload/types';

export const updateStripeCustomer: CollectionBeforeChangeHook = async ({
    req,
    data,
    operation
}) => {
    if (operation === 'update' && data.stripeCustomerId) {
        try {
            await stripe.customers.update(data.stripeCustomerId, {
                name: data.name,
                phone: data.phone,
                address: {
                    line1: data.groupAddress.streetLine1,
                    line2: data.groupAddress.streetLine2,
                    city: data.groupAddress.city,
                    postal_code: data.groupAddress.zip,
                    state: data.groupAddress.state,
                    country: data.groupAddress.country
                },
                shipping: {
                    address: {
                        line1: data.groupAddressShipping.streetLine1,
                        line2: data.groupAddressShipping.streetLine2,
                        city: data.groupAddressShipping.city,
                        postal_code: data.groupAddressShipping.zip,
                        state: data.groupAddressShipping.state,
                        country: data.groupAddressShipping.country
                    },
                    name: data.groupAddressShipping.name,
                    phone: data.groupAddressShipping.phone
                }
            });

            return {
                ...data
            };
        } catch (error: unknown) {
            req.payload.logger.error(
                `Error creating Stripe customer: ${error}`
            );
        }
    }

    return data;
};
