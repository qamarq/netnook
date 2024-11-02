import type { CollectionConfig } from 'payload/types';

import { admins } from '@/components/payload/access/admins';
import { Content } from '@/components/payload/blocks/Content';
import { MediaBlock } from '@/components/payload/blocks/MediaBlock';
import { slugField } from '@/components/payload/fields/slug';
import { beforeProductChange } from './hooks/beforeChange';
import { deleteProductFromCarts } from './hooks/deleteProductFromCarts';
// import { ProductSelect } from './ui/ProductSelect'

const Products: CollectionConfig = {
    slug: 'products',
    admin: {
        useAsTitle: 'title',
        defaultColumns: ['image', 'title', 'stripeProductID', '_status'],
        preview: (doc) => {
            return `${
                process.env.PAYLOAD_PUBLIC_SERVER_URL
            }/next/preview?url=${encodeURIComponent(
                `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/products/${doc.slug}`
            )}&secret=${process.env.PAYLOAD_PUBLIC_DRAFT_SECRET}`;
        },
    },
    hooks: {
        beforeChange: [beforeProductChange],
        afterDelete: [deleteProductFromCarts],
    },
    versions: {
        drafts: true,
    },
    access: {
        read: () => true,
        create: admins,
        update: admins,
        delete: admins,
    },
    fields: [
        {
            name: 'title',
            type: 'text',
            required: true
        },
        {
            name: 'description',
            type: 'textarea',
            required: true,
            maxLength: 250
        },
        {
            name: 'image',
            type: 'upload',
            relationTo: 'media',
            required: true,
            access: {
                read: () => true,
            }
        },
        {
            name: 'publishedOn',
            type: 'date',
            admin: {
                position: 'sidebar',
                date: {
                    pickerAppearance: 'dayAndTime',
                },
            },
            hooks: {
                beforeChange: [
                    ({ siblingData, value }) => {
                        if (siblingData._status === 'published' && !value) {
                            return new Date();
                        }
                        return value;
                    },
                ],
            },
        },
        {
            type: 'tabs',
            tabs: [
                {
                    label: 'Content',
                    fields: [
                        
                        {
                            name: 'layout',
                            type: 'blocks',
                            required: true,
                            blocks: [Content, MediaBlock],
                        },
                    ],
                },
                {
                    label: 'Product Details',
                    fields: [
                        // {
                        //   name: 'stripeProductID',
                        //   label: 'Stripe Product',
                        //   type: 'text',
                        //   admin: {
                        //     components: {
                        //       Field: ProductSelect,
                        //     },
                        //   },
                        // },
                        {
                            name: 'stripeProductID',
                            label: 'Stripe Product',
                            type: 'text',
                        },
                        {
                            name: 'priceJSON',
                            label: 'Price JSON',
                            type: 'textarea',
                            admin: {
                                readOnly: true,
                                hidden: true,
                                rows: 10,
                            },
                        },
                        {
                            name: 'price',
                            label: 'Price',
                            type: 'number',
                            defaultValue: 0,
                            admin: {
                                readOnly: true,
                                hidden: true,
                            },
                        },
                        {
                            name: 'enablePaywall',
                            label: 'Enable Paywall',
                            type: 'checkbox',
                        },
                        {
                            name: 'slider',
                            type: 'array', // required
                            label: 'Image Slider',
                            minRows: 1,
                            maxRows: 10,
                            interfaceName: 'CardSlider', // optional
                            labels: {
                                singular: 'Slide',
                                plural: 'Slides',
                            },
                            admin: {
                                components: {
                                    RowLabel: ({ data, index }) => {
                                        return data?.title || `Slide ${String(index).padStart(2, '0')}`
                                    },
                                },
                            },
                            fields: [
                                {
                                    name: 'image',
                                    type: 'upload',
                                    relationTo: 'media',
                                    required: true
                                },
                            ]
                        },
                        {
                            name: 'specification',
                            type: 'array',
                            fields: [
                                {
                                    name: 'type',
                                    type: 'select',
                                    options: [
                                        {
                                            label: 'Wysokość',
                                            value: 'height',
                                        },
                                        {
                                            label: 'Szerokość',
                                            value: 'width',
                                        },
                                        {
                                            label: 'Głębokość',
                                            value: 'depth',
                                        },
                                        {
                                            label: 'Waga',
                                            value: 'weight',
                                        },
                                        {
                                            label: 'Kod producenta',
                                            value: 'manufacturerCode',
                                        },
                                        {
                                            label: 'Dołączone akcesoria',
                                            value: 'accessories',
                                        },
                                        {
                                            label: 'Dodatkowe informacje',
                                            value: 'additionalInfo',
                                        },
                                        {
                                            label: 'Dołączone oprogramowanie',
                                            value: 'software',
                                        },
                                        {
                                            label: 'Procesor',
                                            value: 'processor',
                                        },
                                        {
                                            label: 'Pamięć RAM',
                                            value: 'ram',
                                        },
                                        {
                                            label: 'Karta graficzna',
                                            value: 'graphicsCard',
                                        },
                                        {
                                            label: 'System operacyjny',
                                            value: 'operatingSystem',
                                        },
                                        {
                                            label: 'Gwarancja',
                                            value: 'warranty',
                                        },
                                        {
                                            label: 'Typ ekranu',
                                            value: 'screenType',
                                        },
                                        {
                                            label: 'Przekątna ekranu',
                                            value: 'screenSize',
                                        },
                                        {
                                            label: 'Rozdzielczość',
                                            value: 'resolution',
                                        },
                                        {
                                            label: 'Dotykowy ekran',
                                            value: 'touchscreen',
                                        },
                                        {
                                            label: 'Kolor dominujący',
                                            value: 'color',
                                        },
                                        {
                                            label: 'Łączność',
                                            value: 'connectivity',
                                        },
                                        {
                                            label: 'Złącza',
                                            value: 'ports',
                                        },
                                        {
                                            label: 'Dysk SSD M.2 PCIe',
                                            value: 'ssd_m2',
                                        },
                                        {
                                            label: "Czujniki",
                                            value: "sensors"
                                        },
                                        {
                                            label: 'Zabezpieczenia',
                                            value: 'security',
                                        },
                                        {
                                            label: 'Zasilacz',
                                            value: 'powerSupply',
                                        }
                                    ],
                                },
                                {
                                    name: 'value',
                                    type: 'textarea',
                                },
                            ],
                            admin: {
                                components: {
                                    RowLabel: ({ data, index }) => {
                                        return `${data?.type} - ${data?.value}` || `Specification ${String(index).padStart(2, '0')}`
                                    },
                                },
                            },
                        },
                    ],
                },
            ],
        },
        {
            name: 'producer',
            type: 'relationship',
            relationTo: 'producers',
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'categories',
            type: 'relationship',
            relationTo: 'categories',
            hasMany: true,
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'relatedProducts',
            type: 'relationship',
            relationTo: 'products',
            hasMany: true,
            filterOptions: ({ id }) => {
                return {
                    id: {
                        not_in: [id],
                    },
                };
            },
        },
        {
            name: 'reviews',
            type: 'array',
            hidden: true,
            access: {
                read: () => true,
                create: () => true,
                update: admins,
            },
            fields: [
                {
                    name: 'author_id',
                    type: 'text',
                },
                {
                    name: 'review',
                    type: 'textarea',
                },
                {
                    name: 'rating',
                    type: 'number',
                    admin: {
                        step: 1,
                    },
                    min: 1,
                    max: 5,
                }
            ]
        },
        slugField(),
        {
            name: 'skipSync',
            label: 'Skip Sync',
            type: 'checkbox',
            admin: {
                position: 'sidebar',
                readOnly: true,
                hidden: true,
            },
        },
        {
            name: 'productEmbeddings',
            type: 'number',
            hidden: true,
            hasMany: true,
        },
        {
            name: 'countOfOrders',
            type: 'number',
            hidden: true,
            defaultValue: 0,
        },
        {
            name: 'stock',
            type: 'number',
            defaultValue: 999,
            admin: {
                position: 'sidebar'
            }
        }
    ],
};

export default Products;
