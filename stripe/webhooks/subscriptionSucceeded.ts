import type Stripe from 'stripe';
import {
    StripeWebhookHandler
// @ts-ignore
} from '@payloadcms/plugin-stripe/dist/types';
import { Order } from '@/payload-types';
import { Payload } from 'payload';

const logs = true;

export const subscriptionSucceeded: StripeWebhookHandler<{
    data: {
        object: Stripe.Price;
    };
}> = async (args: { event: any, payload: Payload, stripe: Stripe }) => {
    const { event, payload, stripe } = args;

    console.log('Payment success webhook received subscriptionSucceeded');
    const session = event.data.object

    console.log(session)

    try {
        if (!session || !session.subscription || !session.metadata.userId) {
            if (logs) payload.logger.error(`❌ No session found with the provided event data.`);
            return;
        }

        console.log(session)

        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        )

        console.log(subscription)

        await payload.update({
            collection: 'users',
            id: session.metadata.userId,
            data: {
                stripeSubscriptionId: subscription.id,
                stripeCurrentPeriodEnd: new Date(
                    subscription.current_period_end * 1000
                ),
            }
        })
    
        if (logs) payload.logger.info(`✅ Successfully updated user subscription.`);
    } catch (error) {
        if (logs) payload.logger.error(`❌ Error updating user subscription: ${error}`);
    }
};
