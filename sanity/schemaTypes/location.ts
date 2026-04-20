import { defineField, defineType } from 'sanity'

export const locationType = defineType({
  name: 'location',
  title: 'Rendelők (Helyszínek)',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Belső név (pl. esztergom, budapest)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Megjelenő név (pl. Esztergomi Rendelő)',
      type: 'string',
    }),
    defineField({
      name: 'address',
      title: 'Cím',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'Fotó a rendelőről',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'tag',
      title: 'Címke (pl. KOMÁROM-ESZTERGOM)',
      type: 'string',
    }),
  ],
})
