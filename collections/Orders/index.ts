import type { CollectionConfig } from 'payload/types';

import { adminsOrOrderedBy } from './access/adminsOrOrderedBy';
import { clearUserCart } from './hooks/clearUserCart';
import { populateOrderedBy } from './hooks/populateOrderedBy';
import { updateUserPurchases } from './hooks/updateUserPurchases';
// import { LinkToPaymentIntent } from './ui/LinkToPaymentIntent';
import { admins } from '@/components/payload/access/admins';
import { adminsOrLoggedIn } from '@/components/payload/access/adminsOrLoggedIn';
import { beforeOrderChange } from './hooks/beforeChange';

export const Orders: CollectionConfig = {
    slug: 'orders',
    admin: {
        useAsTitle: 'id',
        defaultColumns: ['createdAt', 'orderedBy'],
        preview: (doc) =>
            `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/orders/${doc.id}`,
    },
    hooks: {
        beforeChange: [beforeOrderChange],
        afterChange: [updateUserPurchases, clearUserCart],
    },
    access: {
        read: adminsOrOrderedBy,
        update: admins,
        create: adminsOrLoggedIn,
        delete: admins,
    },
    fields: [
        {
            name: 'orderedBy',
            type: 'relationship',
            relationTo: 'users',
            hooks: {
                beforeChange: [populateOrderedBy],
            },
        },
        {
            name: 'stripePaymentIntentID',
            label: 'Stripe Payment Intent ID',
            type: 'text',
            admin: {
                position: 'sidebar',
                // components: {
                //     Field: LinkToPaymentIntent,
                // },
            },
        },
        {
            name: 'status',
            label: 'Status',
            type: 'select',
            admin: {
                position: 'sidebar',
            },
            options: [
                { label: 'Created', value: 'created' },
                { label: 'Paid', value: 'paid' },
                { label: 'Processing', value: 'processing' },
                { label: 'Shipped', value: 'shipped' },
                { label: 'Delivered', value: 'delivered' },
                { label: 'Canceled', value: 'canceled' }
            ],
            defaultValue: 'created',
        },
        {
            name: 'shippingMethod',
            type: 'relationship',
            relationTo: 'shipping_methods',
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'trackingNumber',
            type: 'text',
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'trackingUrl',
            type: 'text',
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'total',
            type: 'number',
            required: true,
            min: 0,
        },
        {
            name: 'items',
            type: 'array',
            fields: [
                {
                    name: 'product',
                    type: 'relationship',
                    relationTo: 'products',
                    required: true,
                },
                {
                    name: 'price',
                    type: 'number',
                    min: 0,
                },
                {
                    name: 'quantity',
                    type: 'number',
                    min: 0,
                },
            ],
        },
    ],
};
