import { type SchemaTypeDefinition } from 'sanity'
import { treatmentType } from './treatment'
import { locationType } from './location'
import post from './post'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [treatmentType, locationType, post],
}
