import { admins } from '@/components/payload/access/admins';
import { HTMLConverterFeature, lexicalEditor, lexicalHTML } from '@payloadcms/richtext-lexical';
import type { CollectionConfig } from 'payload/types';

const Notifications: CollectionConfig = {
    slug: 'notifications',
    admin: {
        useAsTitle: 'title',
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
            name: 'message',
            type: 'richText',
            required: true,
            editor: lexicalEditor({
                features: ({ defaultFeatures }: { defaultFeatures: any }) => [
                  ...defaultFeatures,
                  // The HTMLConverter Feature is the feature which manages the HTML serializers.
                  // If you do not pass any arguments to it, it will use the default serializers.
                  HTMLConverterFeature({}),
                ],
            }),
        },
        lexicalHTML('message', { name: 'message_html' }),
        {
            name: 'type',
            type: 'select',
            options: [
                { label: 'Info', value: 'info' },
                { label: 'Warning', value: 'warning' },
                { label: 'Error', value: 'error' },
            ],
        },
        {
            name: 'read',
            type: 'checkbox',
            defaultValue: false,
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'user',
            type: 'relationship',
            relationTo: 'users',
            required: true
        }
    ],
};

export default Notifications;
