import test from 'node:test'
import assert from 'node:assert/strict'
import { datesOverlap } from './bookingService.js'

test('overlapping date ranges conflict', () => {
  assert.equal(datesOverlap(new Date('2026-11-01'), new Date('2026-11-04'), new Date('2026-11-03'), new Date('2026-11-05')), true)
})

test('checkout and check-in on the same day are allowed', () => {
  assert.equal(datesOverlap(new Date('2026-11-01'), new Date('2026-11-04'), new Date('2026-11-04'), new Date('2026-11-07')), false)
})

test('disjoint dates do not conflict', () => {
  assert.equal(datesOverlap(new Date('2026-11-01'), new Date('2026-11-04'), new Date('2026-11-05'), new Date('2026-11-07')), false)
})
