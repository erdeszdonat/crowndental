'use client'

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { dataset, projectId } from './sanity/env'
import { schema } from './sanity/schemaTypes'
import ArticleBatchImportTool from './sanity/tools/ArticleBatchImportTool'
import BlogSeoMaintenanceTool from './sanity/tools/BlogSeoMaintenanceTool'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool(),
  ],
  tools: [
    {name: 'article-batch-import', title: 'Új cikkek publikálása', component: ArticleBatchImportTool},
    {
      name: 'blog-seo-maintenance',
      title: 'Blog SEO-karbantartás',
      component: BlogSeoMaintenanceTool,
    },
  ],
})
