const logs = false;

export const beforeOrderChange: any = async ({
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
    // check if the title has changed

    // if (data.trackingNumber) {
    //     if (data.)
    // }
    if (!newDoc.shippingMethod || !newDoc.trackingNumber) {
        return newDoc;
    }

    const shippingMethod = await payload.find({
        collection: 'shipping_methods',
        limit: 1,
        where: { id: { equals: newDoc.shippingMethod } }
    })

    if (shippingMethod.docs.length === 0 || !shippingMethod.docs[0].trackingUrl) {
        newDoc.trackingUrl = null;
        return newDoc;
    }

    const preparedTrackingURL = shippingMethod.docs[0].trackingUrl.replace('{{trackingNumber}}', newDoc.trackingNumber);
    newDoc.trackingUrl = preparedTrackingURL;

    return newDoc;
};
