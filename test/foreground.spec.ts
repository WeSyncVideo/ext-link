import { Store, Action } from 'redux'
import { expect } from 'chai'

import createLink from '../src/foreground'
import createMock from './mock/chrome'

interface MockState {
  value: string
}

const initialState = Object.freeze({
  value: 'hello',
})

// TODO: Build mock action type to test type correctness
type MockAction = Action

describe('foreground', function () {
  describe('createLink', function () {
    expect(createLink).be.a('function')
  })

  describe('link', function () {
    let link: Store<MockState, MockAction>
    let chromeMock: typeof chrome

    beforeEach(async function () {
      chromeMock = createMock(initialState)
      link = await createLink<MockState, MockAction>(chromeMock)
    })

    it('should be an object', async function () {
      expect(link).be.an('object')
    })

    describe('dispatch', function () {
      let dispatch: typeof link.dispatch

      beforeEach(async function () {
        ({ dispatch } = link)
      })

      it('is function on link', async function () {
        expect(dispatch).be.a('function')
      })
    })

    describe('subscribe', function () {
      let subscribe: typeof link.subscribe

      beforeEach(async function () {
        ({ subscribe } = link)
      })

      it('is function on link', async function () {
        expect(subscribe).be.a('function')
      })
    })

    describe('getState', function () {
      let getState: typeof link.getState

      beforeEach(async function () {
        ({ getState } = link)
      })

      it('is function on link', async function () {
        expect(getState).be.a('function')
      })
    })

    describe('replaceReducer', function () {
      let replaceReducer: typeof link.replaceReducer

      beforeEach(async function () {
        ({ replaceReducer } = link)
      })

      it('is function on link', async function () {
        expect(replaceReducer).be.a('function')
      })

      it('should throw error', async function () {
        let failed = false
        try {
          (replaceReducer as any)()
        } catch (err) {
          failed = true
        }
        expect(failed).to.be.true
      })
    })
  })
})
