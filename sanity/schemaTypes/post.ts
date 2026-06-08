export default {
  name: 'post',
  title: 'Blog Cikkek',
  type: 'document',
  initialValue: {
    language: 'hu',
    category: 'professional',
  },
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
      name: 'language',
      title: 'Cikk nyelve',
      type: 'string',
      initialValue: 'hu',
      options: {
        list: [
          { title: 'Magyar', value: 'hu' },
          { title: 'Szlovák', value: 'sk' },
          { title: 'Angol', value: 'en' },
          { title: 'Német', value: 'de' },
        ],
        layout: 'radio',
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Blog kategória',
      type: 'string',
      initialValue: 'professional',
      options: {
        list: [
          { title: 'Orvosi szakmai cikkek', value: 'professional' },
          { title: 'Fejlődésünk és érdekességek', value: 'magazine' },
        ],
        layout: 'radio',
      },
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
