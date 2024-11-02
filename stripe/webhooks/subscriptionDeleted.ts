import type Stripe from 'stripe';
import {
    StripeWebhookHandler
// @ts-ignore
} from '@payloadcms/plugin-stripe/dist/types';
import { Order } from '@/payload-types';
import { Payload } from 'payload';

const logs = true;

export const subscriptionDeleted: StripeWebhookHandler<{
    data: {
        object: Stripe.Price;
    };
}> = async (args: { event: any, payload: Payload, stripe: Stripe }) => {
    const { event, payload, stripe } = args;

    console.log('Payment success webhook received subscriptionDeleted');
    const session = event.data.object

    console.log(session)

    try {
        if (!session) {
            if (logs) payload.logger.error(`❌ No session found with the provided event data.`);
            return;
        }

        const user = await payload.find({
            collection: 'users',
            where: {
                stripeSubscriptionId: {
                    equals: session.id
                }
            }
        })
        if (!user || user.totalDocs === 0 || user.docs.length === 0) {
            if (logs) payload.logger.error(`❌ No user found with the provided subscription ID.`);
            return;
        }

        await payload.update({
            collection: 'users',
            id: user.docs[0].id,
            data: {
                stripeSubscriptionId: '',
                stripeCurrentPeriodEnd: 0,
            }
        })
    
        if (logs) payload.logger.info(`✅ Successfully updated user subscription.`);
    } catch (error) {
        if (logs) payload.logger.error(`❌ Error updating user subscription: ${error}`);
    }
};
