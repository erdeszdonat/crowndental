import { type SchemaTypeDefinition } from 'sanity'
import { treatmentType } from './treatment'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [treatmentType],
}
