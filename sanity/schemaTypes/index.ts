import { type SchemaTypeDefinition } from 'sanity'
import { treatmentType } from './treatment'
import post from './post'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [treatmentType, post],
}
