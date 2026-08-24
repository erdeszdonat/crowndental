import {getCliClient} from 'sanity/cli'
import {createClient} from '@sanity/client'

const apiVersion = '2026-08-18'
const writeToken = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_AUTH_TOKEN
const client = writeToken
  ? createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'h68mmabs',
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
      apiVersion,
      token: writeToken,
      useCdn: false,
    })
  : getCliClient({apiVersion})
const applyChanges = process.argv.includes('--apply')
const siteHosts = new Set(['crowndental.hu', 'www.crowndental.hu'])

const exactPathMap = new Map([
  ['/en', '/en'],
  ['/sk', '/sk'],
  ['/de', '/de'],
  ['/idopontfoglalas', '/idopont'],
  ['/en/idopontfoglalas', '/en/idopont'],
  ['/sk/idopontfoglalas', '/sk/idopont'],
  ['/de/idopontfoglalas', '/de/idopont'],
  ['/sk/kezeleses/fogkovezetites', '/sk/kezelesek/esztetikai-fogaszat'],
  ['/sk/kezeleses/tomok', '/sk/kezelesek/esztetikai-fogaszat'],
  ['/sk/kezelesek/fogkovezetites', '/sk/kezelesek/esztetikai-fogaszat'],
  ['/sk/kezelesek/tomok', '/sk/kezelesek/esztetikai-fogaszat'],
  ['/sk/kezelesek/tömesek', '/sk/kezelesek/esztetikai-fogaszat'],
  ['/blog/fogaszati-hid-vagy-implantatum-ar-elonyok-es-elettartam', '/blog/fogaszati-hid-vagy-implantatum'],
  ['/en/blog/dental-bridge-or-implant-comparing-cost-benefits-and-longevity', '/en/blog/dental-bridge-or-implant'],
  ['/de/blog/zahnbruecke-oder-implantat-kosten-vorteile-haltbarkeit', '/de/blog/zahnbruecke-oder-implantat'],
])

const directSlovakTreatmentSlugs = new Set([
  'esztetikai-fogaszat', 'fogfeherites', 'fogsor', 'gyokerkezeles',
  'implantatum', 'koronak-hidak', 'szajsebeszet',
])

function mappedPath(pathname) {
  let decoded
  try {
    decoded = decodeURIComponent(pathname).replace(/\/$/, '') || '/'
  } catch {
    return null
  }
  if (exactPathMap.has(decoded)) return exactPathMap.get(decoded)

  const typoMatch = decoded.match(/^\/sk\/kezeleses\/([^/]+)$/)
  if (typoMatch && directSlovakTreatmentSlugs.has(typoMatch[1])) {
    return `/sk/kezelesek/${typoMatch[1]}`
  }
  return null
}

function repairHref(href) {
  if (typeof href !== 'string' || !href.trim()) return href
  const isAbsolute = /^https?:\/\//i.test(href)

  try {
    const url = new URL(href, 'https://www.crowndental.hu')
    if (isAbsolute && !siteHosts.has(url.hostname)) return href
    const replacement = mappedPath(url.pathname)
    if (!replacement) return href
    if (isAbsolute) return `https://www.crowndental.hu${replacement}${url.search}${url.hash}`
    return `${replacement}${url.search}${url.hash}`
  } catch {
    return href
  }
}

function repairValue(value, counts) {
  if (Array.isArray(value)) return value.map((entry) => repairValue(entry, counts))
  if (!value || typeof value !== 'object') return value

  const copy = {...value}
  if (copy._type === 'link' && typeof copy.href === 'string') {
    const repaired = repairHref(copy.href)
    if (repaired !== copy.href) {
      counts.links += 1
      counts.targets.set(copy.href, (counts.targets.get(copy.href) || 0) + 1)
      copy.href = repaired
    }
  }

  for (const [key, entry] of Object.entries(copy)) {
    if (key !== 'href') copy[key] = repairValue(entry, counts)
  }
  return copy
}

const posts = await client.fetch(`*[_type == "post"]{
  _id, _rev, title, "slug": slug.current, "language": coalesce(language, "hu"), content
}`)

const changed = []
const totals = {links: 0, targets: new Map()}
for (const post of posts) {
  const counts = {links: 0, targets: totals.targets}
  const content = repairValue(post.content, counts)
  if (counts.links > 0) {
    totals.links += counts.links
    changed.push({...post, content, changedLinks: counts.links})
  }
}

console.log(JSON.stringify({
  mode: applyChanges ? 'apply' : 'dry-run',
  scannedPosts: posts.length,
  changedPosts: changed.length,
  changedLinks: totals.links,
  targets: Object.fromEntries(totals.targets),
  posts: changed.map(({_id, slug, language, changedLinks}) => ({_id, slug, language, changedLinks})),
}, null, 2))

if (applyChanges && changed.length) {
  for (let offset = 0; offset < changed.length; offset += 40) {
    let transaction = client.transaction()
    for (const post of changed.slice(offset, offset + 40)) {
      transaction = transaction.patch(post._id, {ifRevisionID: post._rev, set: {content: post.content}})
    }
    await transaction.commit({visibility: 'sync'})
  }
  console.log(`Applied ${totals.links} link repairs in ${changed.length} posts.`)
}
