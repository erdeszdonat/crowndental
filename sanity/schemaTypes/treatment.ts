import { defineField, defineType } from 'sanity'

export const treatmentType = defineType({
  name: 'treatment',
  title: 'Kezelések (Szolgáltatások)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Kezelés Neve (pl. Fogimplantátum)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug (pl. implantatum)',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO Title (A CSV-ből)',
      type: 'string',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Meta Description',
      type: 'text',
    }),
  ],
})
