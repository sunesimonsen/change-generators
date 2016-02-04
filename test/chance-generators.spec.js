/*global describe, it*/
var Chance = require('../lib/chance-generators')
var chance = new Chance(42)
var expect = require('unexpected')

expect.addAssertion('<any> [not] to be contained by <array>', function (expect, item, array) {
  expect(array, '[not] to contain', item)
})

expect.addAssertion('<array> to have unique items', function (expect, arr) {
  var seen = []
  expect(arr, 'to have items satisfying', function (item) {
    expect(seen.indexOf(item), 'to be', -1)
    seen.push(item)
  })
})

describe('chance-generators', function () {
  describe('constructor', () => {
    describe('given a seed', () => {
      it('uses the seed to produce random values', () => {
        expect(new Chance(13).integer(), 'to equal', new Chance(13).integer())
      })
    })

    it('uses a random seed by default', () => {
      expect(new Chance().integer(), 'to be a number')
    })

    it('can be called without new', () => {
      expect(Chance(13).integer(), 'to equal', new Chance(13).integer())
    })
  })

  describe('integer', function () {
    it('produces a random integer', () => {
      expect(chance.integer(), 'to be a number')
    })

    describe('given a min and max value', function () {
      it('returns a new generator function honoring the given constraints', function () {
        expect(chance.integer({ min: 0, max: 10 }), 'when called', 'to be within', 0, 10)
      })
    })

    describe('toString', () => {
      it('returns the name of the generator', () => {
        expect(chance.integer({ max: 10 }).toString(), 'to be', 'integer')
      })
    })
  })

  describe('string', function () {
    it('produces a random string', () => {
      expect(chance.string(), 'to be a string')
    })

    describe('given a length', function () {
      it('returns a new generator function honoring the given constraints', function () {
        expect(chance.string({ length: 4 }), 'when called', 'to have length', 4)
      })
    })
  })

  describe('n', function () {
    describe('given a generator function', function () {
      it('returns a new generator producing arrays with instance of the given generator of length 1', function () {
        expect(chance.n(chance.string), 'when called', 'to satisfy',
               expect.it('to have length', 1).and('to have items satisfying', 'to be a string'))
      })
    })

    describe('given a generator function and a number', () => {
      it('returns a new generator producing arrays with the specified length', function () {
        expect(chance.n(chance.string, 3), 'when called', 'to have length', 3)
      })

      it('returns a new generator producing arrays with instances of the given generator', function () {
        expect(chance.n(chance.string, 3), 'when called',
               'to have items satisfying', 'to be a string')
      })
    })

    describe('given a generator function and another generator producing numbers', () => {
      it('returns a new generator producing arrays with the length specified by the second generator', function () {
        expect(chance.n(chance.string, chance.integer({ min: 2, max: 4 })), 'when called', 'to satisfy', {
          length: expect.it('to be within', 2, 4)
        })
      })

      it('returns a new generator producing arrays with instances of the given generator', function () {
        expect(chance.n(chance.string, chance.integer({ min: 2, max: 4 })), 'when called',
               'to have items satisfying', 'to be a string')
      })
    })

    describe('shrink', () => {
      it('result a new generator that work on the provided data', () => {
        var generator = chance.n(chance.string, chance.integer({ min: 2, max: 4 }))
        for (var i = 0; i < 3; i += 1) {
          var generatedValue = generator()
          generator = generator.shrink(generatedValue)
          expect(generator, 'when called', 'to have items satisfying',
                 'to be contained by', generatedValue)
        }
      })
    })
  })

  describe('shuffle', () => {
    describe('given an array', () => {
      it('returns a new generator producing shuffled versions of the given array', () => {
        expect(chance.shuffle([42, 'foo', { wat: 'taw' }]), 'when called',
              'to contain', 42, 'foo', { wat: 'taw' })
      })
    })

    describe('given an array of generators', () => {
      it('returns a new generator producing shuffled versions of the given array ' +
         'where items are generated by the generators in the array', () => {
        expect(chance.shuffle([chance.integer, true, chance.string]), 'when called',
               'to have items satisfying',
               expect.it('to be a number').or('to be a string').or('to be a boolean'))
      })
    })
  })

  describe('pick', () => {
    describe('given an array', () => {
      it('returns a new generator picking random elements from the array', () => {
        var arr = [42, 'foo', { wat: 'taw' }]
        expect(chance.pick(arr), 'when called', 'to be contained by', arr)
      })
    })

    describe('given an array and a number', () => {
      it('returns a new generator picking the given number of random elements from the array', () => {
        var arr = [42, 'foo', { wat: 'taw' }]
        expect(chance.pick(arr, 2), 'when called', 'to satisfy',
               expect.it('to have length', 2)
                       .and('to have items satisfying', 'to be contained by', arr))
      })
    })

    describe('given an array of generators', () => {
      it('returns a new generator picking random elements from the array ' +
         'where the items are generated by the generators in the array', () => {
        expect(chance.pick([chance.integer, chance.string, true], 2), 'when called',
               'to have items satisfying',
               expect.it('to be a number').or('to be a string').or('to be a boolean'))
      })
    })
  })

  describe('unique', () => {
    describe('given a generator and a number', () => {
      it('returns a new generator that returns the specified number of unique items generated by the given generator', () => {
        var arr = [42, 'foo', { wat: 'taw' }]
        expect(chance.unique(chance.pick(arr), 3), 'when called', 'to satisfy',
               expect.it('to have length', 3)
                       .and('to have items satisfying', 'to be contained by', arr)
                       .and('to have unique items'))
      })
    })
  })

  describe('identity', () => {
    it('generate the given value', () => {
      expect(chance.identity({ foo: 'bar' }), 'when called', 'to equal', {
        foo: 'bar'
      })
    })

    it('always generates the given value', () => {
      const value = { foo: 'bar' }
      for (var i = 0; i < 5; i += 1) {
        expect(chance.identity(value), 'when called', 'to be', value)
      }
    })

    it('does not unwrap generators', () => {
      expect(chance.identity(chance.integer), 'when called', 'to be a function')
    })
  })

  describe('shape', () => {
    describe('given an object', () => {
      it('unwraps generators in the object', () => {
        expect(chance.shape({
          constant: 42,
          x: chance.integer,
          y: chance.integer
        }), 'when called', 'to satisfy', {
          constant: 42,
          x: expect.it('to be a number'),
          y: expect.it('to be a number')
        })
      })
    })
  })
})
