#!/usr/bin/env node
// Genera el SQL de seed de los catalogos a partir de la fuente de verdad que
// hoy vive en el frontend. Node >= 22 importa el .ts directo (type stripping).
//
//   node sdd/database/seed-catalog.mjs > sdd/database/seed-catalog.sql
//
// Falla con codigo != 0 si el catalogo es inconsistente, de modo que sirve como
// check ejecutable y no solo como generador.

import { PBLL_INDICATORS } from '../../frontend/src/data/pbll-indicators.ts'

// --- Datos que no viven en el .ts -------------------------------------------

const TESTS = [
  { code: 'PBLL', name: 'Persona bajo la lluvia', available: true },
  { code: 'HTP', name: 'Casa-Arbol-Persona', available: false },
  { code: 'DF', name: 'Dibujo de la Familia', available: false },
  { code: 'DFH', name: 'Dibujo de la Figura Humana', available: false },
]

const CATEGORY_NAMES = {
  A: 'Recursos expresivos',
  B: 'Analisis de contenido',
  C: 'Expresiones de conflicto',
  D: 'Mecanismos de defensa',
}

// Las 6 del panel en vivo (frontend/src/components/session/ObservationsPanel.tsx).
const QUICK_MARKS = [
  'Pausa prolongada',
  'Uso borrador',
  'Comentario espontaneo',
  'Muestra inseguridad',
  'Pregunto por el paraguas',
  'Roto la hoja',
]

// No existian en el schema v1 (attitude_flags era un JSONB que nadie escribia).
const ATTITUDES = [
  'Colaborador', 'Ansioso', 'Inseguro', 'Impulsivo',
  'Meticuloso', 'Desafiante', 'Retraido', 'Distraido',
]

// --- Utilidades -------------------------------------------------------------

const q = s => `'${String(s).replace(/'/g, "''")}'`

const slug = s =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '')  // quita acentos
    .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')

const fail = msg => { console.error(`seed-catalog: ${msg}`); process.exit(1) }

// --- Derivacion de los catalogos desde los indicadores ----------------------
// Se derivan en vez de hardcodearse para que no puedan desviarse de los datos.

const sections = new Map()   // 'A-1' -> { code, name, prefix, category }

for (const ind of PBLL_INDICATORS) {
  const category = ind.section[0]
  if (!CATEGORY_NAMES[category]) {
    fail(`indicador ${ind.code}: seccion "${ind.section}" no empieza por A/B/C/D`)
  }
  const prefix = ind.code.split('-')[0]
  if (!prefix || prefix === ind.code) {
    fail(`indicador ${ind.code}: no tiene prefijo separado por guion`)
  }

  const seen = sections.get(ind.section)
  if (!seen) {
    sections.set(ind.section, { code: ind.section, name: ind.category, prefix, category })
    continue
  }
  // Aqui esta el check que importa: en el .ts, `category` y `prefix` dependen de
  // `section`, no de `code`. Si un indicador los contradice, el catalogo esta mal
  // y esa es justamente la dependencia parcial que el schema v2 elimina.
  if (seen.name !== ind.category) {
    fail(`seccion ${ind.section}: nombre inconsistente (${q(seen.name)} vs ${q(ind.category)}) en ${ind.code}`)
  }
  if (seen.prefix !== prefix) {
    fail(`seccion ${ind.section}: prefijo inconsistente (${seen.prefix} vs ${prefix}) en ${ind.code}`)
  }
}

const codes = PBLL_INDICATORS.map(i => i.code)
const dupes = codes.filter((c, i) => codes.indexOf(c) !== i)
if (dupes.length) fail(`codigos duplicados: ${[...new Set(dupes)].join(', ')}`)

for (const ind of PBLL_INDICATORS) {
  if (!['auto', 'semi', 'manual'].includes(ind.detection)) {
    fail(`indicador ${ind.code}: detection "${ind.detection}" invalido`)
  }
  if (!ind.title?.trim()) fail(`indicador ${ind.code}: sin title`)
  if (!ind.interpretation?.trim()) fail(`indicador ${ind.code}: sin interpretation`)
}

const usedCategories = [...new Set([...sections.values()].map(s => s.category))].sort()

// --- Emision del SQL --------------------------------------------------------

const out = []
const say = l => out.push(l)

const byDetection = d => PBLL_INDICATORS.filter(i => i.detection === d).length

say('-- =============================================================================')
say('-- PSICOGRAMA — Seed de catalogos')
say(`-- GENERADO por sdd/database/seed-catalog.mjs — no editar a mano.`)
say(`-- Fuente: frontend/src/data/pbll-indicators.ts`)
say('--')
say(`-- ${PBLL_INDICATORS.length} indicadores · ${sections.size} secciones · ${usedCategories.length} categorias`)
say(`-- detection: auto=${byDetection('auto')} semi=${byDetection('semi')} manual=${byDetection('manual')}`)
say('-- =============================================================================')
say('')
say('BEGIN;')
say('')

say('-- Tests ----------------------------------------------------------------------')
for (const t of TESTS) {
  say(`INSERT INTO tests (code, name, is_available) VALUES (${q(t.code)}, ${q(t.name)}, ${t.available})`)
  say(`  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, is_available = EXCLUDED.is_available;`)
}
say('')

say('-- Categorias de indicadores ---------------------------------------------------')
for (const c of usedCategories) {
  say(`INSERT INTO indicator_categories (test_id, code, name)`)
  say(`  SELECT id, ${q(c)}, ${q(CATEGORY_NAMES[c])} FROM tests WHERE code = 'PBLL'`)
  say(`  ON CONFLICT (test_id, code) DO UPDATE SET name = EXCLUDED.name;`)
}
say('')

say('-- Secciones del manual --------------------------------------------------------')
for (const s of [...sections.values()].sort((a, b) => a.code.localeCompare(b.code))) {
  say(`INSERT INTO manual_sections (category_id, code, name, code_prefix)`)
  say(`  SELECT c.id, ${q(s.code)}, ${q(s.name)}, ${q(s.prefix)}`)
  say(`  FROM indicator_categories c JOIN tests t ON t.id = c.test_id`)
  say(`  WHERE t.code = 'PBLL' AND c.code = ${q(s.category)}`)
  say(`  ON CONFLICT (category_id, code) DO UPDATE SET name = EXCLUDED.name, code_prefix = EXCLUDED.code_prefix;`)
}
say('')

say('-- Indicadores ----------------------------------------------------------------')
for (const i of PBLL_INDICATORS) {
  say(`INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)`)
  say(`  SELECT ${q(i.code)}, s.id, ${q(i.title)}, ${q(i.interpretation)}, ${q(i.detection)}`)
  say(`  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id`)
  say(`  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = ${q(i.section)}`)
  say(`  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,`)
  say(`    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,`)
  say(`    detection_type = EXCLUDED.detection_type;`)
}
say('')

say('-- Marcas rapidas -------------------------------------------------------------')
QUICK_MARKS.forEach((label, n) => {
  say(`INSERT INTO quick_mark_catalog (code, label, display_order) VALUES (${q(slug(label))}, ${q(label)}, ${n + 1})`)
  say(`  ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, display_order = EXCLUDED.display_order;`)
})
say('')

say('-- Actitudes ------------------------------------------------------------------')
ATTITUDES.forEach((label, n) => {
  say(`INSERT INTO attitude_catalog (code, label, display_order) VALUES (${q(slug(label))}, ${q(label)}, ${n + 1})`)
  say(`  ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, display_order = EXCLUDED.display_order;`)
})
say('')

// Si el equipo elige la Opcion A (alinear el motor con el Capitulo 1, que excluye
// C y D citando Lin et al. 2022), esto lo aplica sin borrar nada del catalogo.
say('-- Opcion A del plan: desactivar C y D para alinear con el Capitulo 1.')
say('-- Descomentar si el equipo confirma esa decision.')
say('-- UPDATE indicator_catalog SET is_active = false WHERE section_id IN (')
say('--   SELECT s.id FROM manual_sections s')
say("--   JOIN indicator_categories c ON c.id = s.category_id WHERE c.code IN ('C','D'));")
say('')
say('COMMIT;')

process.stdout.write(out.join('\n') + '\n')

console.error(
  `seed-catalog: OK — ${PBLL_INDICATORS.length} indicadores, ${sections.size} secciones, ` +
  `${usedCategories.length} categorias, ${QUICK_MARKS.length} marcas, ${ATTITUDES.length} actitudes`
)
