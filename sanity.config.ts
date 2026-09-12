'use client'

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { dataset, projectId } from './sanity/env'
import { schema } from './sanity/schemaTypes'
import BlogSeoMaintenanceTool from './sanity/tools/BlogSeoMaintenanceTool'
import ContentReleaseTool from './sanity/tools/ContentReleaseTool'

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
      name: 'content-release',
      title: 'Tartalmi kiadás',
      component: ContentReleaseTool,
    },
    {
      name: 'blog-seo-maintenance',
      title: 'Blog SEO-karbantartás',
      component: BlogSeoMaintenanceTool,
    },
  ],
})
