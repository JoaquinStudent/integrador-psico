import { createClient } from '@supabase/supabase-js'

const url = 'https://qqhqsjobbbmkhyvteyfc.supabase.co'
const key = process.env.SUPABASE_ANON_KEY

if (!key) {
  console.log('Uso: SUPABASE_ANON_KEY=... node validate-bucket.mjs')
  console.log('O:   SUPABASE_ANON_KEY="$(grep VITE_SUPABASE_ANON_KEY .env | cut -d= -f2)" node validate-bucket.mjs')
  process.exit(1)
}

const supabase = createClient(url, key)

async function validate() {
  const results = []

  // 1. Bucket exists
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets()
  if (bErr) { console.log('ERROR listando buckets:', bErr.message); process.exit(1) }

  const bucket = buckets.find(b => b.id === 'audio-recordings')
  if (!bucket) { console.log('FALLO: Bucket "audio-recordings" no existe. Crealo en Dashboard > Storage.'); process.exit(1) }

  results.push(['Bucket existe', 'OK'])
  results.push(['Privado', bucket.public ? 'FALLO (es publico, deberia ser privado)' : 'OK'])

  // 2. Anon upload should fail (private bucket, no auth)
  const testBlob = new Blob(['test'], { type: 'audio/webm' })
  const { error: anonErr } = await supabase.storage
    .from('audio-recordings')
    .upload('_test_anon.webm', testBlob)
  if (anonErr) {
    results.push(['Upload sin auth rechazado', 'OK'])
  } else {
    results.push(['Upload sin auth rechazado', 'FALLO (subio sin auth — revisar policies)'])
    await supabase.storage.from('audio-recordings').remove(['_test_anon.webm'])
  }

  // 3. Table accessible
  const { error: dbErr } = await supabase.from('audio_recordings').select('id').limit(0)
  results.push(['Tabla audio_recordings', dbErr ? `FALLO: ${dbErr.message}` : 'OK'])

  // 4. MIME restriction
  const pngBlob = new Blob(['fake'], { type: 'image/png' })
  const { error: mimeErr } = await supabase.storage
    .from('audio-recordings')
    .upload(`_test_mime_${Date.now()}.png`, pngBlob, { contentType: 'image/png' })
  if (mimeErr) {
    results.push(['MIME restriction (bloquea no-audio)', 'OK'])
  } else {
    results.push(['MIME restriction', 'NO CONFIGURADA (acepto png — opcional)'])
  }

  console.log('\n  Validacion bucket audio-recordings\n')
  let allOk = true
  results.forEach(([check, status]) => {
    const ok = status.includes('OK')
    if (!ok) allOk = false
    console.log(`  ${ok ? '✓' : '✗'} ${check}: ${status}`)
  })
  console.log(`\n  ${allOk ? 'Todo OK' : 'Hay items por corregir'}\n`)
}

validate().catch(e => { console.error('Error:', e.message); process.exit(1) })
