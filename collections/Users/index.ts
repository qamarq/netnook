import type { CollectionConfig } from 'payload/types';
import { ensureFirstUserIsAdmin } from './hooks/ensureFirstUserIsAdmin';
import { admins } from '@/components/payload/access/admins';
import { anyone } from '@/components/payload/access/anyone';
import { checkRole } from './checkRole';
import adminsAndUser from '@/components/payload/access/adminsAndUsers';
import { Resend } from 'resend';
import { RegisterTemplate } from '@/components/mails/register-template';
import { createStripeCustomer } from './hooks/createStripeCustomer';
import { updateStripeCustomer } from './hooks/updateStripeCustomer';
import { resolveDuplicatePurchases } from './hooks/resolveDuplicatePurchases';

const resend = new Resend(process.env.RESEND_API_KEY);

export const Users: CollectionConfig = {
    slug: 'users',
    admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'email'],
    },
    access: {
        read: adminsAndUser,
        create: anyone,
        update: adminsAndUser,
        delete: admins,
        admin: ({ req: { user } }) => checkRole(['admin'], user as any),
    },
    hooks: {
        beforeChange: [createStripeCustomer, updateStripeCustomer],
    },
    // auth: {
    //     tokenExpiration: 7200, // How many seconds to keep the user logged in
    //     verify: true, // Require email verification before being allowed to authenticate
    //     maxLoginAttempts: 5, // Automatically lock a user out after X amount of failed logins
    //     lockTime: 600 * 1000, // Time period to allow the max login attempts
    // },
    auth: {
        verify: {
            generateEmailHTML: async ({ req, token, user }) => {
                const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/verify?token=${token}`
                console.log('URL', url)
                await resend.emails.send({
                    from: 'NoteNook <notenook@kamilmarczak.pl>',
                    to: [user.email],
                    subject: 'Confirm your email address',
                    react: RegisterTemplate({ name: user.name, link: url }),
                    html: '', // Add the html property here
                });

                return `Hey ${user.email}, verify your email by clicking here: ${url}`
            },
        },
    },
    fields: [
        {
            label: 'Page account info',
            type: 'collapsible',
            fields: [
                {
                    name: 'name',
                    label: 'Name',
                    type: 'text',
                    required: true,
                },
                {
                    name: 'roles',
                    type: 'select',
                    hasMany: true,
                    defaultValue: ['customer'],
                    options: [
                        {
                            label: 'admin',
                            value: 'admin',
                        },
                        {
                            label: 'customer',
                            value: 'customer',
                        },
                    ],
                    hooks: {
                        beforeChange: [ensureFirstUserIsAdmin],
                    },
                    access: {
                        read: admins,
                        create: admins,
                        update: admins,
                    },
                },
                {
                    name: 'avatar',
                    type: 'upload',
                    relationTo: 'media'
                },
            ],
        },
        {
            label: 'Account info',
            type: 'collapsible',
            fields: [
                {
                    name: 'phone',
                    type: 'text',
                    hooks: {
                        beforeChange: [
                            (args) => {
                                if (args.previousValue !== args.value) {
                                    console.log('Phone number changed')
                                }
                            }
                        ]
                    },
                },
                {
                    name: 'groupAddress',
                    type: 'group',
                    interfaceName: 'Address',
                    fields: [
                        {
                            name: 'streetLine1',
                            type: 'text',
                        },
                        {
                            name: 'streetLine2',
                            type: 'text',
                        },
                        {
                            name: 'city',
                            type: 'text',
                        },
                        {
                            name: 'zip',
                            type: 'text',
                        },
                        {
                            name: 'state',
                            type: 'text',
                        },
                        {
                            name: 'country',
                            type: 'select',
                            options: [
                                { label: 'Poland', value: 'PL' },
                            ]
                        },
                    ]
                },
                {
                    name: 'groupAddressShipping',
                    type: 'group',
                    interfaceName: 'Address Shipping',
                    fields: [
                        {
                            name: 'name',
                            type: 'text',
                        },
                        {
                            name: 'phone',
                            type: 'text',
                        },
                        {
                            name: 'streetLine1',
                            type: 'text',
                        },
                        {
                            name: 'streetLine2',
                            type: 'text',
                        },
                        {
                            name: 'city',
                            type: 'text',
                        },
                        {
                            name: 'zip',
                            type: 'text',
                        },
                        {
                            name: 'state',
                            type: 'text',
                        },
                        {
                            name: 'country',
                            type: 'select',
                            options: [
                                { label: 'Poland', value: 'PL' },
                            ]
                        },
                    ]
                }
            ],
        },
        {
            name: 'stripeCustomerId',
            label: 'Stripe Customer',
            type: 'text',
            admin: {
                readOnly: true,
            },
        },
        {
            name: 'stripeSubscriptionId',
            type: 'text',
            admin: {
                readOnly: true,
            },
        },
        {
            name: 'stripeCurrentPeriodEnd',
            type: 'date',
            admin: {
                readOnly: true,
            },
        },
        {
            name: 'purchases',
            label: 'Purchases',
            type: 'relationship',
            relationTo: 'products',
            hasMany: true,
            hooks: {
                beforeChange: [resolveDuplicatePurchases],
            },
        },
        {
            label: 'Cart',
            name: 'cart',
            type: 'group',
            fields: [
                {
                    name: 'items',
                    label: 'Items',
                    type: 'array',
                    interfaceName: 'CartItems',
                    fields: [
                        {
                            name: 'product',
                            type: 'relationship',
                            relationTo: 'products',
                        },
                        {
                            name: 'quantity',
                            type: 'number',
                            min: 0,
                            admin: {
                            step: 1,
                            },
                        },
                    ],
                },
                {
                    name: 'createdOn',
                    label: 'Created On',
                    type: 'date',
                    admin: {
                        readOnly: true
                    }
                },
                {
                    name: 'lastModified',
                    label: 'Last Modified',
                    type: 'date',
                    admin: {
                        readOnly: true
                    }
                },
            ],
        },
        // {
        //     name: 'paymentMethods',
        //     label: 'Payment Methods',
        //     type: 'array',
        //     admin: { readOnly: true, },
        //     fields: [
        //         {
        //             name: 'id',
        //             type: 'text',
        //             admin: { readOnly: true, },
        //         },
        //         {
        //             name: 'type',
        //             type: 'text',
        //             admin: { readOnly: true, },
        //         },
        //         {
        //             name: 'card',
        //             label: 'Card',
        //             type: 'group',
        //             admin: { readOnly: true, },
        //             fields: [
        //                 {
        //                     name: 'brand',
        //                     type: 'text',
        //                 },
        //                 {
        //                     name: 'last4',
        //                     type: 'text',
        //                 },
        //                 {
        //                     name: 'exp_month',
        //                     type: 'text',
        //                 },
        //                 {
        //                     name: 'exp_year',
        //                     type: 'text',
        //                 },
        //             ],
        //         },
        //     ],
        // }
    ],
};
