import { expect } from 'chai'

import createLink from '../src/background'

describe('background', function () {
  describe('createLink', function () {
    it('should be a function', async function () {
      expect(createLink).be.a('function')
    })
  })
})
