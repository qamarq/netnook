import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload/config';
import sharp from 'sharp'
import { fileURLToPath } from 'url';
import { stripePlugin } from '@payloadcms/plugin-stripe'

import { Users } from './collections/Users';
import { Media } from './collections/Media';
import Categories from './collections/Categories';
import Products from './collections/Products';
import Producers from './collections/Producers';
import ShippingMethods from './collections/ShippingMethods';
import { Orders } from './collections/Orders';
import DashboardHeader from './components/payload/DashboardHeader';
import Notifications from './collections/Notifications';
import { productUpdated } from './stripe/webhooks/productUpdated';
import { priceUpdated } from './stripe/webhooks/priceUpdated';
import { paymentSucceeded } from './stripe/webhooks/paymentSucceeded';
import { subscriptionSucceeded } from './stripe/webhooks/subscriptionSucceeded';
import { subscriptionDeleted } from './stripe/webhooks/subscriptionDeleted';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
    admin: {
        user: Users.slug,
        components: {
            beforeDashboard: [
                DashboardHeader
            ]
        }
    },
    collections: [ Users, Media, Products, Categories, Producers, ShippingMethods, Orders, Notifications ],
    editor: lexicalEditor({}),
    plugins: [
        stripePlugin({
            stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
            isTestKey: Boolean(process.env.PAYLOAD_PUBLIC_STRIPE_IS_TEST_KEY),
            stripeWebhooksEndpointSecret: process.env.STRIPE_WEBHOOKS_SIGNING_SECRET,
            rest: false,
            webhooks: {
                'product.created': productUpdated,
                'product.updated': productUpdated,
                // 'customer.updated': customerUpdated,
                'price.updated': priceUpdated,
                'payment_intent.succeeded': paymentSucceeded,
                'checkout.session.completed': subscriptionSucceeded,
                'invoice.payment_succeeded': subscriptionSucceeded,
                'customer.subscription.deleted': subscriptionDeleted,
            },
        }),
    ],
    secret: process.env.PAYLOAD_SECRET || '',
    typescript: {
        outputFile: path.resolve(dirname, 'payload-types.ts'),
    },
    db: mongooseAdapter({
        url: process.env.DATABASE_URI || '',
    }),
    sharp
});
