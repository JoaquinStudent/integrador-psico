// Logica pura del lienzo del paciente. Sin dependencias: `node --test tests/`
// (Node >= 22 importa .ts directo). Por eso los modulos probados no importan nada.
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { decidir, ESTADO_INICIAL } from '../src/canvas/input.ts'
import { dimensiones, giroLaHoja, orientacionDeViewport } from '../src/canvas/orientation.ts'
import { offsetsDeTrazo, pausasEntreTrazos } from '../src/canvas/timing.ts'

// --- Tiempos: el bug de los `started_at_ms` en 0 -------------------------------------

test('el inicio del trazo es un offset desde el inicio de la toma, no cero', () => {
  // Pen-down a los 4,2 s de la consigna; el trazo dura 800 ms.
  const o = offsetsDeTrazo(10_000 + 4_200, [{ t: 0 }, { t: 300 }, { t: 800 }], 10_000)
  assert.deepEqual(o, { started_at_ms: 4_200, ended_at_ms: 5_000 })
})

test('un trazo anterior al inicio de la toma no da offsets negativos', () => {
  assert.deepEqual(offsetsDeTrazo(900, [{ t: 0 }, { t: 100 }], 1_000), {
    started_at_ms: 0,
    ended_at_ms: 100,
  })
})

test('sin t0 (borrador viejo) se cae a offsets relativos, nunca a NaN', () => {
  const o = offsetsDeTrazo(undefined, [{ t: 0 }, { t: 250 }], 1_000)
  assert.deepEqual(o, { started_at_ms: 0, ended_at_ms: 250 })
})

test('la pausa se mide entre el fin de un trazo y el inicio del siguiente', () => {
  const trazos = [
    { inicio: 0, fin: 1_000 },
    { inicio: 1_500, fin: 2_000 }, // 500 ms: no es pausa
    { inicio: 6_000, fin: 7_000 }, // 4 s: pausa
    { inicio: 12_500, fin: 13_000 }, // 5,5 s: pausa
  ]
  assert.equal(pausasEntreTrazos(trazos, 3_000), 2)
})

test('con trazos que empiezan todos en 0 no hay pausas (el sintoma del bug)', () => {
  const rotos = [
    { inicio: 0, fin: 900 },
    { inicio: 0, fin: 1_200 },
  ]
  assert.equal(pausasEntreTrazos(rotos, 3_000), 0)
})

// --- Orientacion de la hoja (RF-17) --------------------------------------------------

test('la hoja se entrega horizontal y el viewport decide cual se usa', () => {
  assert.equal(orientacionDeViewport(1280, 800), 'horizontal')
  assert.equal(orientacionDeViewport(800, 1280), 'vertical')
  assert.equal(orientacionDeViewport(900, 900), 'horizontal')
})

test('las dimensiones conservan la proporcion de la hoja carta', () => {
  const h = dimensiones('horizontal')
  const v = dimensiones('vertical')
  assert.equal(h.width, v.height)
  assert.equal(h.height, v.width)
  assert.ok(Math.abs(h.width / h.height - 28 / 22) < 0.05)
})

test('girar la hoja es dejarla distinta a como se entrego', () => {
  assert.equal(giroLaHoja('horizontal'), false)
  assert.equal(giroLaHoja('vertical'), true)
})

// --- Entrada: rechazo de palma y un solo puntero -------------------------------------

test('con lapiz, el tacto (la palma) se ignora', () => {
  let r = decidir(ESTADO_INICIAL, { pointerId: 1, pointerType: 'pen' })
  assert.equal(r.acepta, true)
  r = decidir({ ...r.estado, activo: null }, { pointerId: 2, pointerType: 'touch' })
  assert.equal(r.acepta, false)
})

test('sin lapiz, el dedo dibuja', () => {
  const r = decidir(ESTADO_INICIAL, { pointerId: 7, pointerType: 'touch' })
  assert.equal(r.acepta, true)
  assert.equal(r.estado.activo, 7)
})

test('mientras hay un trazo en curso, un segundo puntero se ignora', () => {
  const a = decidir(ESTADO_INICIAL, { pointerId: 1, pointerType: 'touch' })
  const b = decidir(a.estado, { pointerId: 2, pointerType: 'touch' })
  assert.equal(b.acepta, false)
  assert.equal(b.estado.activo, 1)
})
