'use client'

import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { dataset, projectId } from './sanity/env'
import { schema } from './sanity/schemaTypes'

export default defineConfig({
  basePath: '/studio', // Ezen az URL-en fog futni a studio
  projectId,
  dataset,
  schema,
  plugins: [
    deskTool(),
  ],
})
