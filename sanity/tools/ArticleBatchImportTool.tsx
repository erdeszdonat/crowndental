'use client'
import {useState} from 'react'
import {useClient} from 'sanity'

type Photo = {key: string; filename: string; data: string}
type Entry = {_id: string; _type: 'post'; title: string; language: string; slug: {current: string}; mainImage: Record<string, unknown> & {photoKey: string}; content: Array<Record<string, any>>}
type Bundle = {projectId: string; dataset: string; photos: Photo[]; posts: Entry[]}

export default function ArticleBatchImportTool() {
  const client = useClient({apiVersion: '2024-03-10'})
  const [bundle, setBundle] = useState<Bundle | null>(null)
  const [message, setMessage] = useState('')
  const [running, setRunning] = useState(false)
  async function preview() {
    try {
      const data: Bundle = await (await fetch('/article-batch-local.json')).json()
      if (data.projectId !== client.config().projectId || data.dataset !== client.config().dataset || data.posts.length !== 12 || data.posts.some(p => p._type !== 'post' || !p._id.startsWith('organic-20261010-'))) throw new Error('Eltérő projekt vagy hibás csomag.')
      setBundle(data)
      setMessage(`${data.posts.length} új cikk és ${data.photos.length} új fotó. Kiadó: Crown Dental. Nyelvek: HU, SK, EN, DE.`)
    } catch(e) {setMessage(String(e))}
  }
  async function publish() {
    if (!bundle || running) return
    setRunning(true)
    try {
      const existing = await client.fetch('*[_type == "post" && slug.current in $slugs]{_id}', {slugs: bundle.posts.map(p=>p.slug.current)}, {perspective:'raw'})
      if (existing.some((p: {_id:string}) => !bundle.posts.some(b => b._id === p._id))) throw new Error('Létező slug: publikálás megszakítva.')
      const refs: Record<string,string> = {}
      for (const photo of bundle.photos) {
        setMessage(`Fotó feltöltése: ${photo.filename}`)
        const bytes = Uint8Array.from(atob(photo.data), c=>c.charCodeAt(0))
        const asset = await client.assets.upload('image', new Blob([bytes], {type:'image/webp'}), {filename:photo.filename})
        refs[photo.key]=asset._id
      }
      const tx=client.transaction()
      for (const entry of bundle.posts) {
        const {photoKey,...image}=entry.mainImage
        const mainImage={...image,_type:'image',asset:{_type:'reference',_ref:refs[photoKey]}}
        const content=entry.content.map(block=>{
          if (block._type!=='image') return block
          const {photoKey,...rest}=block
          if (!refs[photoKey]) throw new Error('Hiányzó kép')
          return {...rest,asset:{_type:'reference',_ref:refs[photoKey]}}
        })
        tx.createIfNotExists({...entry,mainImage,content})
      }
      setMessage('12 új cikk közzététele…')
      await tx.commit({autoGenerateArrayKeys:false})
      const count=await client.fetch('count(*[_id in $ids])',{ids:bundle.posts.map(p=>p._id)},{perspective:'published'})
      setMessage(`Sikeres publikálás: ${count}/12 cikk, ${bundle.photos.length} fotó a Sanity production adatbázisban.`)
    } catch(e) {setMessage(String(e))} finally {setRunning(false)}
  }
  return <main style={{padding:32,maxWidth:1000,margin:'auto',fontFamily:'system-ui'}}>
    <h1>Új Crown Dental cikkek – 2026. október 10.</h1>
    <p>Csak új dokumentumok; a meglévő cikkekhez nem nyúl. Képek tömörített WebP formátumban.</p>
    <button onClick={preview} disabled={running} style={{padding:16,marginRight:12}}>Csomag előnézete</button>
    <button onClick={publish} disabled={!bundle||running} style={{padding:16}}>12 cikk és képek publikálása</button>
    <p role="status" style={{padding:16,background:'#edf6ff'}}>{message}</p>
    {bundle?.posts.map(p=><div key={p._id}><strong>{p.language.toUpperCase()}</strong> · {p.title}<small style={{display:'block',color:'#666'}}>/blog/{p.slug.current}</small></div>)}
  </main>
}
