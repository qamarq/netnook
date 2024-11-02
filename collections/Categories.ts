import type { CollectionConfig } from 'payload/types';

const Categories: CollectionConfig = {
    slug: 'categories',
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
            name: 'description',
            type: 'textarea',
            required: true
        },
        {
            name: 'parent',
            type: 'relationship',
            relationTo: 'categories',
        }
    ],
};

export default Categories;
