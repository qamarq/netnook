import { admins } from '@/components/payload/access/admins';
import { CollectionConfig } from 'payload/types';

export const Media: CollectionConfig = {
    slug: 'media',
    upload: {
        staticDir: 'public/files',
        imageSizes: [
            // {
            //     name: 'icon',
            //     width: 400,
            //     height: 400,
            //     position: 'centre',
            // },
            {
                name: 'thumbnail',
                width: 400,
                height: 300,
                position: 'centre',
            },
            {
                name: 'card',
                width: 768,
                height: 1024,
                position: 'centre',
            },
            {
                name: 'tablet',
                width: 1024,
                // By specifying `undefined` or leaving a height undefined,
                // the image will be sized to a certain width,
                // but it will retain its original aspect ratio
                // and calculate a height automatically.
                height: undefined,
                position: 'centre',
            },
        ],
        adminThumbnail: 'thumbnail',
        mimeTypes: ['image/*'],
    },
    access: {
        create: admins,
        read: () => true,
        update: admins,
        delete: admins,
    },
    fields: [
        {
            name: 'alt',
            type: 'text',
        },
        {
            name: 'caption',
            type: 'richText',
        },
    ],
};
