'use client'

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { dataset, projectId } from './sanity/env'
import { schema } from './sanity/schemaTypes'
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
    {
      name: 'blog-seo-maintenance',
      title: 'Blog SEO-karbantartás',
      component: BlogSeoMaintenanceTool,
    },
  ],
})
