import { prepareString, vectorize } from '@/lib/semantic';
import { stripe } from '@/lib/stripe';
// import Stripe from 'stripe';

// const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
// const stripe = new Stripe(stripeSecretKey || '', { apiVersion: '2024-04-10' });

const logs = true;

export const beforeProductChange: any = async ({
    req,
    data,
}: {
    req: any;
    data: any;
}) => {
    const { payload } = req;
    const newDoc: Record<string, unknown> = {
        ...data,
        skipSync: false, // Set back to 'false' so that all changes continue to sync to Stripe
    };

    const preparedStrings = prepareString([data.title, data.description])
    const vectorized = await vectorize(preparedStrings);
    newDoc.productEmbeddings = vectorized;
    // check if the title has changed

    if (data.skipSync) {
        if (logs) payload.logger.info(`Skipping product 'beforeChange' hook`);
        return newDoc;
    }

    if (!data.stripeProductID) {
        if (logs)
            payload.logger.info(
                `No Stripe product assigned to this document, skipping product 'beforeChange' hook`
            );
        return newDoc;
    }

    if (logs) payload.logger.info(`Looking up product from Stripe...`);

    try {
        const stripeProduct = await stripe.products.retrieve(
            data.stripeProductID
        );
        if (logs)
            payload.logger.info(
                `Found product from Stripe: ${stripeProduct.name}`
            );
        // newDoc.name = stripeProduct.name;
        // newDoc.description = stripeProduct.description;
    } catch (error: unknown) {
        payload.logger.error(`Error fetching product from Stripe: ${error}`);
        return newDoc;
    }

    if (logs) payload.logger.info(`Looking up price from Stripe...`);

    try {
        const allPrices = await stripe.prices.list({
            product: data.stripeProductID,
            limit: 100,
        });

        newDoc.priceJSON = JSON.stringify(allPrices);
        newDoc.price = allPrices.data[0].unit_amount;
    } catch (error: unknown) {
        payload.logger.error(`Error fetching prices from Stripe: ${error}`);
    }

    return newDoc;
};
