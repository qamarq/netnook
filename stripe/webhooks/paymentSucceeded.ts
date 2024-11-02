import type Stripe from 'stripe';
import {
    StripeWebhookHandler
// @ts-ignore
} from '@payloadcms/plugin-stripe/dist/types';
import { Order } from '@/payload-types';

const logs = true;

export const paymentSucceeded: StripeWebhookHandler<{
    data: {
        object: Stripe.Price;
    };
}> = async (args: any) => {
    const { event, payload, stripe } = args;

    console.log('Payment success webhook received');
    const paymentIntentId = event.data.object.id

    try {
        const order = await payload.find({
            collection: 'orders',
            where: {
                stripePaymentIntentID: {
                    equals: paymentIntentId
                }
            }
        })
    
        if (!order || order.totalDocs === 0 || order.docs.lenght === 0) {
            if (logs) payload.logger.error(`❌ No order found with the provided payment intent ID.`);
            return;
        }
    
        const orderData = order.docs[0] as Order;
        await payload.update({
            collection: 'orders',
            id: orderData.id,
            data: {
                status: 'paid'
            }
        });
    
        if (logs) payload.logger.info(`✅ Successfully updated order status.`);
    } catch (error) {
        if (logs) payload.logger.error(`❌ Error updating order status: ${error}`);
    }
};
