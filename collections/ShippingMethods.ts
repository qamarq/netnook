import type { CollectionConfig } from 'payload/types';

const ShippingMethods: CollectionConfig = {
    slug: 'shipping_methods',
    admin: {
        useAsTitle: 'title',
    },
    access: {
        read: () => true,
    },
    fields: [
        {
            name: 'title',
            type: 'text',
            required: true
        },
        {
            name: 'price',
            type: 'number',
            required: true
        },
        {
            name: 'logo',
            type: 'upload',
            relationTo: 'media',
            required: true
        },
        {
            name: 'deliveryDaysTime',
            type: 'number',
            required: true
        },
        {
            name: 'freeFrom',
            type: 'number',
            required: false,
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'type',
            type: 'select',
            options: [
                { label: 'Kurier', value: 'courier' },
                { label: 'Paczkomat', value: 'parcel_locker' },
                { label: 'Odbiór osobisty', value: 'pickup' },
            ],
            required: true,
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'paymentType',
            type: 'select',
            options: [
                { label: 'Za pobraniem', value: 'cash_on_delivery' },
                { label: 'Z góry', value: 'prepayment' },
            ],
            required: true,
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'trackingUrl',
            type: 'text',
            required: false,
            admin: {
                position: 'sidebar',
                placeholder: 'https://example.com.pl/track?number={{trackingNumber}}'
            },
        }
    ],
};

export default ShippingMethods;
