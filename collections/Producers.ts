import type { CollectionConfig } from 'payload/types';

const Producers: CollectionConfig = {
    slug: 'producers',
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
            name: 'parent',
            type: 'relationship',
            relationTo: 'producers',
        }
    ],
};

export default Producers;
