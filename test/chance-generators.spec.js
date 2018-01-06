/*global describe, it*/
const Chance = require('../lib/chance-generators')
const expect = require('unexpected')

expect.addAssertion('<any> [not] to be contained by <array>', (expect, item, array) => {
  expect(array, '[not] to contain', item)
})

expect.addAssertion('<string> to have length satisfying <assertion>', (expect, value) => {
  expect.shift(value.length)
})

expect.addAssertion('<array> to have unique items', (expect, arr) => {
  const seen = []
  expect(arr, 'to have items satisfying', (item) => {
    expect(seen.indexOf(item), 'to be', -1)
    seen.push(item)
  })
})

describe('chance-generators', () => {
  let chance

  beforeEach(() => {
    chance = new Chance(42)
  })

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

  describe('integer', () => {
    it('produces a random integer', () => {
      expect(chance.integer(), 'to be a number')
    })

    describe('given a min and max value', () => {
      it('returns a new generator function honoring the given constraints', () => {
        expect(chance.integer({ min: 0, max: 10 }), 'when called', 'to be within', 0, 10)
      })
    })

    describe('toString', () => {
      it('returns the name of the generator', () => {
        expect(chance.integer({ max: 10 }).toString(), 'to be', 'integer')
      })
    })

    describe('map', () => {
      it('returns a new generator where the generated values are mapped with the given function', () => {
        expect(
          chance.integer({ min: -10, max: 10 }).map(v => v + 10),
          'when called',
          'to be within', 0, 20
        )
      })

      describe('shrink', () => {
        it('returns a new generator where the input is shrunken with with regards to the original generator', () => {
          let generator = chance.integer({ min: -10, max: 10 }).map(v => v + 10)
          while (generator.shrink) {
            generator = generator.shrink(generator())
          }
          expect(generator, 'when called', 'to equal', 10)
        })

        it('keeps the map even when called out of order', () => {
          let generator = chance.integer({ min: -10, max: 10 }).map(v => '' + v)
          const val = generator()
          generator()
          generator = generator.shrink(val)
          expect(generator, 'when called', 'to be a string')
        })
      })
    })

    describe('expand', () => {
      it('returns a new generator that work on the provided data plus random data from the origin generator', () => {
        const originalGenerator = chance.integer({ min: -10, max: 10 })
        const expandedGenerator = originalGenerator.expand(0)

        expect([
          expandedGenerator(),
          expandedGenerator(),
          expandedGenerator(),
          expandedGenerator(),
          expandedGenerator(),
          expandedGenerator(),
          expandedGenerator()
        ], 'to equal', [
          0, 9, 0, 0, -7, -7, -9
        ])
      })
    })
  })

  describe('string', () => {
    it('produces a random string', () => {
      expect(chance.string(), 'to be a string')
    })

    describe('given a length', () => {
      it('returns a new generator function honoring the given constraints', () => {
        expect(chance.string({ length: 4 }), 'when called', 'to have length', 4)
      })
    })

    describe('shrink', () => {
      it('returns a new generators that generates new strings by deleting characters from the original string', () => {
        const generator = chance.string({ length: chance.natural({ min: 2, max: 10 }) })
        const shrunkenGenerator = generator.shrink('foobarbaz')

        expect([
          shrunkenGenerator(),
          shrunkenGenerator(),
          shrunkenGenerator(),
          shrunkenGenerator(),
          shrunkenGenerator()
        ], 'to satisfy', [
          'foo', 'foobarbaz', 'foobarb', 'fooba', 'farbaz'
        ])
      })

      it('shrinks towards the minimum allowed length', () => {
        let generator = chance.string({ length: chance.natural({ min: 2, max: 10 }) })

        while (generator.shrink) {
          generator = generator.shrink(generator())
        }

        expect(generator, 'when called', 'to have length', 2)
      })
    })

    describe('map', () => {
      it('returns a new generator where the generated values are mapped with the given function', () => {
        const generator = chance.string.map(s => s.toUpperCase()).map(s => s.replace(/[^A-Z]/g, '-'))

        expect(
          generator,
          'when called',
          'to match', /[A-Z-]*/
        )
      })

      describe('shrink', () => {
        it('returns a new generator where the input is shrunken with with regards to the original generator', () => {
          let generator = chance.string({ length: chance.natural({ max: 10 }) })
              .map(s => s.toUpperCase())
              .map(s => s.replace(/[^A-Z]/g, '-'))

          while (generator.shrink) {
            generator = generator.shrink(generator())
          }

          expect(generator, 'when called', 'to equal', '')
        })
      })
    })

    describe('expand', () => {
      it('returns a new generator that work on the provided data plus random data from the origin generator', () => {
        const lengthGenerator = chance.natural({ max: 30 })
        const originalGenerator = chance.string({ length: lengthGenerator })
        const expandedGenerator = originalGenerator.expand('foobarbaz')

        expect([
          expandedGenerator(),
          expandedGenerator(),
          expandedGenerator(),
          expandedGenerator(),
          expandedGenerator(),
          expandedGenerator(),
          expandedGenerator()
        ], 'to equal', [
          '(foobarblz', 'panfoTbarbazvMT', 'foobarbaz', 'foobarbaz', 'nc)f5obarbaz&yg', ')uSfoobarbaz', 'ifoobarbazx'
        ])
      })
    })
  })

  describe('stringSplicer', () => {
    it('throw when not given a string', () => {
      expect(() => {
        chance.stringSplicer()
      }, 'to throw', 'The stringSplicer requires a string as the first argument')

      expect(() => {
        chance.stringSplicer({})
      }, 'to throw', 'The stringSplicer requires a string as the first argument')
    })

    it('produces a string by splicing out regions from the given string', () => {
      const generator = chance.stringSplicer('foobarbaz')

      expect([
        generator(),
        generator(),
        generator(),
        generator(),
        generator(),
        generator(),
        generator()
      ], 'to equal', [
        'foo', 'foobarbaz', 'foobarb', 'fooba', 'frbaz', 'foobarbaz', 'arbaz'
      ])
    })

    it('shrinks towards the empty string', () => {
      let generator = chance.stringSplicer('foobarbaz')
      while (generator.shrink) {
        generator = generator.shrink(generator())
      }
      expect(generator, 'when called', 'to be empty')
    })

    describe('when given a min', () => {
      it('shrinks towards a string of the min length', () => {
        let generator = chance.stringSplicer('foobarbaz', { min: 3 })
        while (generator.shrink) {
          generator = generator.shrink(generator())
        }
        expect(generator, 'when called', 'to have length', 3)
      })

      it('produces a string by splicing out regions from the given string, while preserving the min constraint', () => {
        const generator = chance.stringSplicer('foobarbaz', { min: 6 })

        expect([
          generator(),
          generator(),
          generator(),
          generator(),
          generator(),
          generator(),
          generator()
        ], 'to equal', [
          'foobaz', 'foobarbaz', 'foobarb', 'foobaaz', 'fobarbaz', 'foobarbaz', 'oobarbaz'
        ])
      })
    })

    it('supports the map method', () => {
      const generator = chance.stringSplicer('foobarbaz').map(s => '>' + s)

      expect([
        generator(),
        generator(),
        generator(),
        generator(),
        generator(),
        generator(),
        generator()
      ], 'to equal', [
        '>foo', '>foobarbaz', '>foobarb', '>fooba', '>frbaz', '>foobarbaz', '>arbaz'
      ])
    })
  })

  describe('n', () => {
    describe('given a generator function', () => {
      it('returns a new generator producing arrays with instance of the given generator of length 1', () => {
        expect(chance.n(chance.string), 'when called', 'to satisfy',
               expect.it('to have length', 1).and('to have items satisfying', 'to be a string'))
      })
    })

    describe('given a generator function and a number', () => {
      it('returns a new generator producing arrays with the specified length', () => {
        expect(chance.n(chance.string, 3), 'when called', 'to have length', 3)
      })

      it('returns a new generator producing arrays with instances of the given generator', () => {
        expect(chance.n(chance.string, 3), 'when called',
               'to have items satisfying', 'to be a string')
      })
    })

    describe('given a generator function and another generator producing numbers', () => {
      it('returns a new generator producing arrays with the length specified by the second generator', () => {
        expect(chance.n(chance.string, chance.integer({ min: 2, max: 4 })), 'when called', 'to satisfy', {
          length: expect.it('to be within', 2, 4)
        })
      })

      it('returns a new generator producing arrays with instances of the given generator', () => {
        expect(chance.n(chance.string, chance.integer({ min: 2, max: 4 })), 'when called',
               'to have items satisfying', 'to be a string')
      })
    })

    describe('shrink', () => {
      it('returns a new generator that work on the provided data', () => {
        let generator = chance.n(chance.string, chance.integer({ min: 2, max: 4 }))
        while (generator.shrink) {
          generator = generator.shrink(generator())
        }
        expect(generator, 'when called', 'to have length', 2)
      })
    })

    describe('expand', () => {
      it('returns a new generator that work on the provided data plus random data from the origin generator', () => {
        const valueGenerator = chance.string
        const lengthGenerator = chance.integer({ min: 2, max: 4 })
        const originalGenerator = chance.n(valueGenerator, lengthGenerator)
        const expandedGenerator = originalGenerator.expand(['foo', 'bar', 'baz'])

        expect([expandedGenerator(), expandedGenerator(), expandedGenerator(), expandedGenerator()], 'to equal', [
          [ 'baz', 'bar', 'SSlGlheH#ySk0Wbe)' ],
          [ 'baz', 'bar', ']nTwTMa', 'foo' ],
          [ 'kdv[BrHg6To', 'foo', 'baz' ],
          [ 'bar', 'baz', 'foo' ]
        ])
      })
    })
  })

  describe('array', () => {
    describe('given a generator function', () => {
      it('returns a new generator producing arrays with instance of the given generator of length 0-50', () => {
        expect(chance.array(chance.string), 'when called', 'to satisfy', (array) => {
          expect(array, 'to satisfy', {
            length: expect.it('to be within', 0, 50)
          }).and('to have items satisfying', 'to be a string')
        })
      })
    })

    describe('given a generator function and a number', () => {
      it('returns a new generator producing arrays with the specified length', () => {
        expect(chance.array(chance.string, 3), 'when called', 'to have length', 3)
      })

      it('returns a new generator producing arrays with instances of the given generator', () => {
        expect(chance.array(chance.string, 3), 'when called',
               'to have items satisfying', 'to be a string')
      })
    })

    describe('given a generator function and another generator producing numbers', () => {
      it('returns a new generator producing arrays with the length specified by the second generator', () => {
        expect(chance.array(chance.string, chance.integer({ min: 2, max: 4 })), 'when called', 'to satisfy', {
          length: expect.it('to be within', 2, 4)
        })
      })

      it('returns a new generator producing arrays with instances of the given generator', () => {
        expect(chance.array(chance.string, chance.integer({ min: 2, max: 4 })), 'when called',
               'to have items satisfying', 'to be a string')
      })
    })

    describe('shrink', () => {
      it('returns a new generator that work on the provided data', () => {
        let generator = chance.array(chance.string, chance.integer({ min: 2, max: 10 }))
        while (generator.shrink) {
          generator = generator.shrink(generator())
        }
        expect(generator, 'when called', 'to have length', 2)
      })
    })
  })

  describe('arraySplicer', () => {
    it('throw when not given an array', () => {
      expect(() => {
        chance.arraySplicer()
      }, 'to throw', 'The arraySplicer requires an array as the first argument')

      expect(() => {
        chance.arraySplicer({})
      }, 'to throw', 'The arraySplicer requires an array as the first argument')
    })

    it('produces a array by splicing out regions from the given array', () => {
      const generator = chance.arraySplicer('foobarbaz'.split(''))

      expect([
        generator(),
        generator(),
        generator(),
        generator(),
        generator(),
        generator(),
        generator()
      ], 'to equal', [
        [ 'f', 'o', 'o' ],
        [ 'f', 'o', 'o', 'b', 'a', 'r', 'b', 'a', 'z' ],
        [ 'f', 'o', 'o', 'b', 'a', 'r', 'b' ],
        [ 'f', 'o', 'o', 'b', 'a' ],
        [ 'f', 'r', 'b', 'a', 'z' ],
        [ 'f', 'o', 'o', 'b', 'a', 'r', 'b', 'a', 'z' ],
        [ 'a', 'r', 'b', 'a', 'z' ]
      ])
    })

    describe('when given items that are generators', () => {
      it('unwraps the items', () => {
        const valueGenerator = chance.natural({ max: 10 })
        const generator = chance.arraySplicer([valueGenerator, valueGenerator, 'foo', 42])

        expect([
          generator(),
          generator(),
          generator(),
          generator(),
          generator(),
          generator(),
          generator()
        ], 'to equal', [
          [ 10 ],
          [ 42 ],
          [ 6, 1, 'foo' ],
          [ 1, 0, 'foo', 42 ],
          [ 3, 6 ], [ 42 ],
          [ 0, 10, 'foo', 42 ]
        ])
      })

      it('shrinks the item generators', () => {
        const valueGenerator = chance.natural({ min: 2, max: 10 })
        let generator = chance.arraySplicer([valueGenerator, valueGenerator, 'foo', 42], { min: 2 })

        while (generator.shrink) {
          generator = generator.shrink(generator())
        }

        expect(generator(), 'to equal', [ 2, 42 ])
      })
    })

    it('shrinks towards the empty array', () => {
      let generator = chance.arraySplicer('foobarbaz'.split(''))
      while (generator.shrink) {
        generator = generator.shrink(generator())
      }
      expect(generator, 'when called', 'to be empty')
    })

    describe('when given a min', () => {
      it('shrinks towards an array of the min length', () => {
        let generator = chance.arraySplicer('foobarbaz'.split(''), { min: 3 })
        while (generator.shrink) {
          generator = generator.shrink(generator())
        }
        expect(generator, 'when called', 'to have length', 3)
      })

      it('produces a string by splicing out regions from the given array, while preserving the min constraint', () => {
        const generator = chance.arraySplicer('foobarbaz'.split(''), { min: 6 })

        expect([
          generator(),
          generator(),
          generator(),
          generator(),
          generator(),
          generator(),
          generator()
        ], 'to equal', [
          [ 'f', 'o', 'o', 'b', 'a', 'z' ],
          [ 'f', 'o', 'o', 'b', 'a', 'r', 'b', 'a', 'z' ],
          [ 'f', 'o', 'o', 'b', 'a', 'r', 'b' ],
          [ 'f', 'o', 'o', 'b', 'a', 'a', 'z' ],
          [ 'f', 'o', 'b', 'a', 'r', 'b', 'a', 'z' ],
          [ 'f', 'o', 'o', 'b', 'a', 'r', 'b', 'a', 'z' ],
          [ 'o', 'o', 'b', 'a', 'r', 'b', 'a', 'z' ]
        ])
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
        const arr = [42, 'foo', { wat: 'taw' }]
        expect(chance.pick(arr), 'when called', 'to be contained by', arr)
      })
    })

    describe('given an array and a number', () => {
      it('returns a new generator picking the given number of random elements from the array', () => {
        const arr = [42, 'foo', { wat: 'taw' }]
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

  describe('pickset', () => {
    it('returns a new generator picking the given number of random elements from the array', () => {
      const arr = [42, 'foo', { wat: 'taw' }]
      expect(chance.pickset(arr, 2), 'when called', 'to satisfy',
             expect.it('to have length', 2)
             .and('to have items satisfying', 'to be contained by', arr))
    })

    describe('expand', () => {
      it('returns a new generator that work on the provided data plus random data from the origin generator', () => {
        const valueGenerator = chance.string
        const lengthGenerator = chance.integer({ min: 2, max: 20 })
        const originalGenerator = chance.pickset(Array(20).fill(valueGenerator), lengthGenerator)
        const expandedGenerator = originalGenerator.expand(['foo', 'bar', 'baz'])

        expect([expandedGenerator(), expandedGenerator(), expandedGenerator(), expandedGenerator()], 'to equal', [
          [ ')19*p', 'foo', 'MaFbvMTDkdv[Br', 'baz', 'mHea(*)P7CwbhrY' ],
          [ 'UHyheBxXyX1RVu$PIC', 'foo', 'bar', 'baz', 'JxPLZ^ksSEN3pq*' ],
          [ ')%P%$U', 'foo', 'bar', 'baz', 'HW]qn0brKyn3BW3!' ],
          [ 'foo', 'bar', 'baz' ]
        ])
      })
    })
  })

  describe('pickone', () => {
    describe('given an array', () => {
      it('returns a new generator picking a random element from the array', () => {
        const arr = [42, 'foo', { wat: 'taw' }]
        expect(chance.pickone(arr), 'when called', 'to be one of', arr)
      })
    })

    describe('given an array of generators', () => {
      it('returns a new generator picking a random elements from the array ' +
         'where the items are generated by the generators in the array', () => {
        const coordinates = chance.shape({
          x: chance.integer,
          y: chance.integer
        })

        for (var i = 0; i < 10; i += 1) {
          expect(
            chance.pickone([chance.integer, coordinates, chance.string, true]),
            'when called',
            expect.it('to be a number').or('to be a string').or('to be a boolean').or('to satisfy', {
              x: expect.it('to be a number'),
              y: expect.it('to be a number')
            })
          )
        }
      })
    })
  })

  describe('unique', () => {
    describe('given a generator and a number', () => {
      it('generates arrays with unique values from that generator', () => {
        const arr = [42, 13, 666, 3.14]
        const generator = chance.unique(chance.pick(arr), 2)
        expect([generator(), generator(), generator(), generator()], 'to satisfy', [
          [ 13, 3.14 ],
          [ 3.14, 42 ],
          [ 666, 3.14 ],
          [ 666, 42 ]
        ])
      })

      it('returns a new generator that returns the specified number of unique items generated by the given generator', () => {
        const arr = [42, 'foo', { wat: 'taw' }]
        expect(chance.unique(chance.pick(arr), 3), 'when called', 'to satisfy',
               expect.it('to have length', 3)
                       .and('to have items satisfying', 'to be contained by', arr)
                       .and('to have unique items'))
      })
    })

    describe('when given a comparator function', () => {
      it('uses the comparator function to decide if items are equal', () => {
        const persons = chance.pickone([
          'Sune', 'Andreas', 'Gustav', 'Alex', 'Peter',
          'Sune', 'Andreas', 'Gustav', 'Alex', 'Peter',
          'Sune', 'Andreas', 'Gustav', 'Alex', 'Peter',
          'Sune', 'Andreas', 'Gustav', 'Alex', 'Peter',
          'Sune', 'Andreas', 'Gustav', 'Alex', 'Peter'
        ].map(name => ({ name })))

        expect(chance.unique(persons, 5, {
          comparator: (arr, person) => arr.some(p => p.name === person.name)
        }), 'when called', 'to satisfy', [
          { name: 'Peter' },
          { name: 'Alex' },
          { name: 'Andreas' },
          { name: 'Gustav' },
          { name: 'Sune' }
        ])
      })
    })

    describe('shrink', () => {
      it('generates smaller sub-sets of the given data', () => {
        const generator = chance.unique(chance.state, chance.natural({ max: 10 }))

        const shrunkenGenerator = generator.shrink(['SC', 'WV', 'FL'])
        expect([shrunkenGenerator(), shrunkenGenerator(), shrunkenGenerator()], 'to satisfy', [
          ['SC'],
          ['SC', 'WV', 'FL'],
          ['SC', 'WV']
        ])
      })

      it('returns a new generator generating smaller unique sets', () => {
        let generator = chance.unique(chance.state, chance.natural({ max: 10 }))

        while (generator.shrink) {
          generator = generator.shrink(generator())
        }

        expect(generator, 'when called', 'to be empty')
      })
    })
  })

  describe('weighted', () => {
    describe('given an array of values and weights', () => {
      it('generates values picks values from the array based on the weights', () => {
        const arr = [42, chance.string, 666, chance.character]
        const weights = [10, 20, 1, 20]
        const generator = chance.weighted(arr, weights)
        expect([generator(), generator(), generator(), generator()], 'to satisfy', [
          '(n25SSlGlheH#ySk0', 'b', 42, '1'
        ])
      })
    })

    describe('shrink', () => {
      describe('when the picked value is a generator', () => {
        it('shrinks the value with regards to the picked generator', () => {
          const arr = [chance.string, chance.natural({ min: 10, max: 20 })]
          const weights = [10, 20]
          const generator = chance.weighted(arr, weights)

          const value = generator()
          const shrunkenGenerator = generator.shrink(value)
          expect([value, shrunkenGenerator(), shrunkenGenerator(), shrunkenGenerator()], 'to satisfy', [
            18, 18, 11, 16
          ])
        })
      })

      describe('when the picked value is not a generator', () => {
        it('does not shrink the value', () => {
          const arr = [0, 1]
          const weights = [10, 20]
          const generator = chance.weighted(arr, weights)

          const value = generator()
          const shrunkenGenerator = generator.shrink(value)
          expect([value, shrunkenGenerator(), shrunkenGenerator(), shrunkenGenerator()], 'to satisfy', [
            1, 1, 1, 1
          ])
        })
      })
    })

    describe('expand', () => {
      describe('when the picked value is a generator', () => {
        it('expands the value with regards to the picked generator', () => {
          const arr = [chance.natural({ min: 10, max: 20 }), chance.string]
          const weights = [10, 20]
          const generator = chance.weighted(arr, weights)

          const value = generator()
          const expandedGenerator = generator.expand(value)
          expect([value, expandedGenerator(), expandedGenerator(), expandedGenerator()], 'to satisfy', [
            '(n25SSlGlheH#ySk0',
            '(n25SSlGnheH#ySk0',
            '(n25SSlGlheH#ySk0',
            '(n25SSlGlheH#ySkF'
          ])
        })
      })

      describe('when the picked value is not a generator', () => {
        it('does not expand the value', () => {
          const arr = [0, 1]
          const weights = [10, 20]
          const generator = chance.weighted(arr, weights)

          const value = generator()
          const expandedGenerator = generator.expand(value)
          expect([value, expandedGenerator(), expandedGenerator(), expandedGenerator()], 'to satisfy', [
            1, 1, 1, 1
          ])
        })
      })
    })
  })

  describe('constant', () => {
    it('generate the given value', () => {
      expect(chance.constant({ foo: 'bar' }), 'when called', 'to equal', {
        foo: 'bar'
      })
    })

    it('always generates the given value', () => {
      const value = { foo: 'bar' }
      const generator = chance.constant(value)
      for (let i = 0; i < 5; i += 1) {
        expect(generator, 'when called', 'to be', value)
      }
    })

    it('does not unwrap generators', () => {
      expect(chance.constant(chance.integer), 'when called', 'to be a function')
    })

    it('supports the map method', () => {
      const generator = chance.constant(42).map((value) => {
        return chance.natural({ max: value })
      })
      expect(generator, 'when called', 'to be within', 0, 42)
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
      for (let i = 0; i < 5; i += 1) {
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

    describe('shrink', () => {
      it('returns a new generator that work on the provided data', () => {
        let generator = chance.shape({
          constant: 42,
          x: chance.integer({ min: 2, max: 4 }),
          y: chance.integer({ min: 2, max: 4 })
        })

        for (let i = 0; i < 3; i += 1) {
          let generatedValue = generator()
          generator = generator.shrink(generatedValue)
          expect(generator, 'when called', 'to satisfy', {
            constant: 42,
            x: expect.it('to be less than or equal to', generatedValue.x),
            y: expect.it('to be less than or equal to', generatedValue.y)
          })
        }
      })
    })

    describe('expand', () => {
      it('returns a new generator that expands the entry generators', () => {
        let originalGenerator = chance.shape({
          constant: 42,
          number: chance.integer({ min: 2, max: 4 }),
          string: chance.string({ length: chance.natural({ max: 20 }) })
        })

        const expandedGenerator = originalGenerator.expand({
          constant: 42,
          number: 3,
          string: 'foobar'
        })

        expect([
          expandedGenerator(),
          expandedGenerator(),
          expandedGenerator(),
          expandedGenerator(),
          expandedGenerator(),
          expandedGenerator(),
          expandedGenerator()
        ], 'to equal', [
          { constant: 42, number: 3, string: 'fooblr' },
          { constant: 42, number: 3, string: 'aFfoobardv' },
          { constant: 42, number: 3, string: 'foobara' },
          { constant: 42, number: 4, string: 'jfoobarC' },
          { constant: 42, number: 3, string: 'foobar' },
          { constant: 42, number: 3, string: 'foobar' },
          { constant: 42, number: 4, string: 'ukfoobarF5' }
        ])
      })
    })

    describe('map', () => {
      it('returns a new generator where the generated values are mapped with the given function', () => {
        const generator = chance.shape({
          x: chance.integer,
          y: chance.integer
        }).map(coordinate => `${coordinate.x},${coordinate.y}`)

        expect(
          generator,
          'when called',
          'to match', /\d+,\d+/
        )
      })

      it('should not unwrap Object subclasses', () => {
        function Foo (value) {
          this.value = value
        }

        expect(
          chance.integer({ min: 0, max: 10 }).map(value => new Foo(value)),
          'when called',
          'to be a', Foo
        )
      })

      it('provides the generator instance as the second parameter to the mapper function', () => {
        expect(
          chance.integer({ min: 0, max: 10 }).map((length, { array, string }) => (
            array(string({ length }))
          )),
          'when called',
          'to have items satisfying',
          'to have length satisfying',
          'to be within', 0, 10
        )
      })

      describe('shrink', () => {
        it('returns a new generator where the input is shrunken with with regards to the original generator', () => {
          let generator = chance.shape({
            x: chance.integer({ min: -20, max: 20 }),
            y: chance.integer({ min: -20, max: 20 })
          }).map(coordinate => `${coordinate.x},${coordinate.y}`)

          while (generator.shrink) {
            generator = generator.shrink(generator())
          }

          expect(generator, 'when called', 'to equal', '0,0')
        })
      })

      describe('shrink', () => {
        it('returns a new generator where the input is expanded with with regards to the original generator', () => {
          let generator = chance.shape({
            x: chance.integer({ min: -20, max: 20 }),
            y: chance.integer({ min: -20, max: 20 })
          }).map(coordinate => `${coordinate.x},${coordinate.y}`)

          const expandedGenerator = generator.expand(generator())

          expect([
            expandedGenerator(),
            expandedGenerator(),
            expandedGenerator(),
            expandedGenerator(),
            expandedGenerator(),
            expandedGenerator()
          ], 'to satisfy', [
            '18,12', '-5,-14', '-14,-18', '15,4', '-5,-20', '-5,12'
          ])
        })
      })
    })
  })

  describe('sequence', () => {
    describe('given a function', () => {
      it('uses the function to generate a sequence of values', () => {
        const generator = chance.sequence((context) => {
          context.gender = context.gender === 'female' ? 'male' : 'female'
          return {
            gender: context.gender,
            age: chance.natural({ max: 100 })
          }
        })

        expect(generator, 'when called', 'to have items satisfying', {
          gender: expect.it('to match', /female|male/),
          age: expect.it('to be within', 0, 100)
        })
      })
    })

    describe('shrink', () => {
      it('returns a new generator that work on the provided data', () => {
        let generator = chance.sequence((context, previous) => {
          const length = previous === undefined
                ? 50
                : Math.max(0, previous.length - 1)

          return chance.string({ length })
        })

        while (generator.shrink) {
          generator = generator.shrink(generator())
        }

        expect(generator, 'when called', 'to be empty')
      })
    })

    describe('expand (when resumable)', () => {
      it('returns a new generator continues when the sequence generator stopped', () => {
        let generator = chance.sequence((context, previous) => {
          const length = previous === undefined
                ? 25
                : Math.max(0, previous.length - 1)

          return chance.string({ length })
        }, chance.natural({ max: 30 }), { resumable: true })

        const value = generator()

        expect(value, 'to satisfy', [
          '(n25SSlGlheH#ySk0Wbe)19*p',
          'n]nTwTMaFbvMTDkdv[BrHg6T',
          'CM[RId@SYmHea(*)P7Cwbhr',
          'rGYjTK9cm^CtnX3xFMpOQn',
          ')!5H*D%&S1&ygQoMd)y!C',
          'uN9RA)uSOukv7mfb]F5D',
          'vab8o00165Sf&AWi^@!',
          'HyheBxXyX1RVu$PICi',
          '0!41Pr5sKcM0FibGh',
          'c%VJxPLZ^ksSEN3p',
          '*fSvZl$&U7vUh#H'
        ])

        const expandedGenerator = generator.expand(value)

        expect(expandedGenerator(), 'to satisfy', [
          '(n25SSlGlheH#ySk0Wbe)19*p',
          'n]nTwTMaFbvMTDkdv[BrHg6T',
          'CM[RId@SYmHea(*)P7Cwbhr',
          'rGYjTK9cm^CtnX3xFMpOQn',
          ')!5H*D%&S1&ygQoMd)y!C',
          'uN9RA)uSOukv7mfb]F5D',
          'vab8o00165Sf&AWi^@!',
          'HyheBxXyX1RVu$PICi',
          '0!41Pr5sKcM0FibGh',
          'c%VJxPLZ^ksSEN3p',
          '*fSvZl$&U7vUh#H',
          'nE%$Ny7j%Ax^iu',
          'VFa8A@wamLNEJ',
          'Zitys*mxqMP0',
          'Ae)s)ssZK0w',
          'v]ctT[LEdc',
          'z^UrYkNKH',
          'OrRXf4Br',
          '17BIU[U',
          'N8g79l',
          'LnZd@',
          'yYqb',
          'L7q',
          'Vh',
          '*',
          '',
          ''
        ])
      })
    })
  })

  describe('magicString', () => {
    describe('when global.recordLocation.magicValues is available', () => {
      beforeEach(() => {
        global.recordLocation = { magicValues: new Set(['foo', 'bar', 'baz']) }
      })

      afterEach(() => {
        delete global.recordLocation
      })

      it('randomly pick magic strings', () => {
        const generator = chance.magicString

        expect([
          generator(),
          generator(),
          generator(),
          generator(),
          generator()
        ], 'to satisfy', [
          'bar', 'baz', 'baz', 'foo', 'baz'
        ])
      })
    })
  })

  describe('text', () => {
    it('generates random text', () => {
      const generator = chance.text

      expect([
        generator(),
        generator(),
        generator(),
        generator(),
        generator()
      ], 'to satisfy', [
        'Wosalda kodtac ewegute bibro celel taj sibsof buunu bave dolbaw gokim sab ziwiwwuh gib ejjitluh jahfab zejaaf.',
        'asoojduv',
        'HyheBxXyX1RVu$',
        'Wus hogbimab gatih vudsi gewse iwahoil giimeduj deg bueh pi hoje fef wijug howeju. Umi je hodpizhir leg liptemdov pa envewi logumem fojdewire guz regduw ipaje. Ivuzuecu iro lavub ki nozgo pe los vendijjeg ukiipi povivho sataf nuhijoow ru uvake jel re. Onagouja juh warlihak epcibtof wecuv lini kiruen haahra ese tic girofod pohakmi haucmor fune dof jozwom wibse daj. Da ura doal nimap ibebopiv vapop enotilip am tettufja la to veer.',
        '8tuKiZZzU*'
      ])
    })

    describe('when global.recordLocation.magicValues is available', () => {
      beforeEach(() => {
        global.recordLocation = { magicValues: new Set(['foo', 'bar', 'baz']) }
      })

      afterEach(() => {
        delete global.recordLocation
      })

      it('takes advantage of the magic strings', () => {
        const generator = chance.text

        expect([
          generator(),
          generator(),
          generator(),
          generator(),
          generator()
        ], 'to satisfy', [
          'Wosalda kodtac ewegute bibro celel taj sibsof buunu bave dolbaw gokim sab ziwiwwuh gib ejjitluh jahfab zejaaf.',
          'asoojduv',
          'bar',
          'Le votevned esohogbi dadeip riide rohu jod tuhdulhak retijic ti luh pi hoje fef.',
          'Cuug poh ub umi je hodpizhir leg liptemdov pa envewi logumem fojdewire guz regduw ipaje ewumovecu. Vonlavub ki nozgo pe los vendijjeg ukiipi povivho sataf nuhijoow ru uvake jel. Muvona to fejuhera lihakhup patofcok ivbedin kiruen haahra ese tic girofod pohakmi haucmor. Od hiwa jozwom wibse daj ca ez nazinef tetu cejtu emofoc obututven nuawo upuge. La to veer ag do tubokuhi zi usilesev egizosde pitkedeb iva uzoli.'
        ])
      })
    })
  })
})
