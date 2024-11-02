import type { Block, Field } from 'payload/types'

import { invertBackground } from '../../fields/invertBackground'
import link from '../../fields/link'

const columnFields: Field[] = [
  {
    name: 'size',
    type: 'select',
    defaultValue: 'oneThird',
    options: [
      {
        value: 'oneThird',
        label: 'One Third',
      },
      {
        value: 'half',
        label: 'Half',
      },
      {
        value: 'twoThirds',
        label: 'Two Thirds',
      },
      {
        value: 'full',
        label: 'Full',
      },
    ],
  },
  {
    name: 'enableLink',
    type: 'checkbox',
  },
link({
    overrides: {
        admin: {
            condition: (_: any, { enableLink }: { enableLink: boolean }) => Boolean(enableLink),
        },
    },
}),
]

export const Content: Block = {
  slug: 'content',
  fields: [
    invertBackground,
    {
      name: 'columns',
      type: 'array',
      fields: columnFields,
    },
  ],
}
