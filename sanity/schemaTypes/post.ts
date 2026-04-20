export default {
  name: 'post',
  title: 'Blog Cikkek',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Cikk címe (A weboldalon megjelenő cím)',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'URL útvonal (Slug)',
      description: 'FONTOS: A régi cikkeknél pontosan a megadott új linket használd! (pl. faj-vagy-csak-kellemetlen)',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'seoTitle',
      title: 'SEO Cím (A Google-nek)',
      description: 'Másold be ide az Excelből a 3. oszlopot (Title)',
      type: 'string',
    },
    {
      name: 'seoDescription',
      title: 'SEO Leírás (A Google-nek)',
      description: 'Másold be ide az Excelből a 4. oszlopot (Meta description)',
      type: 'text',
      rows: 3,
    },
    {
      name: 'publishedAt',
      title: 'Publikálás dátuma',
      type: 'date',
      options: { dateFormat: 'YYYY-MM-DD' }
    },
    {
      name: 'excerpt',
      title: 'Rövid összefoglaló (Kártyára a főoldalon)',
      type: 'text',
      rows: 3,
    },
    {
      name: 'mainImage',
      title: 'Kiemelt kép',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'content',
      title: 'Cikk tartalma',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image' }],
    }
  ],
}
