import { Store, Action } from 'redux'
import { expect } from 'chai'

import createForegroundLink from '../src/foreground'
import { SUBSCRIBE_TYPE, TARGET_FOREGROUND } from '../src/common'
import createMock, { Mock } from './mock/api'

interface MockState {
  value: string
}

const initialState = Object.freeze({
  value: 'hello',
})

const action = Object.freeze({
  type: 'test',
  payload: {
    value: 'aValue',
  },
})

// TODO: Build mock action type to test type correctness
type MockAction = Action

describe('foreground', function () {
  describe('createForegroundLink', function () {
    expect(createForegroundLink).be.a('function')
  })

  describe('link', function () {
    let link: Store<MockState, MockAction>
    let mock: Mock

    beforeEach(async function () {
      mock = createMock()
      mock.prepareResponse({ __initialState__: initialState })
      link = await createForegroundLink<MockState, MockAction>(mock.api)
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

      it('should send message containing action to background', async function () {
        return new Promise((resolve) => {
          // act
          dispatch(action)

          // assert
          setTimeout(() => {
            const { messages } = mock
            expect(messages).have.lengthOf(2, 'expected 2 messages')
            const msg = messages.find(m => m.__action__)
            expect(msg).have.property('__action__')
            const { __action__ } = msg
            expect(__action__).have.property('type', action.type)
            expect(__action__).have.property('payload')
            const { payload } = __action__
            expect(payload).have.property('value', action.payload.value)
            expect(Object.keys(__action__)).have.lengthOf(2, 'expected action have two keys')
            expect(Object.keys(payload)).have.lengthOf(1, 'expected payload have single key')
            resolve()
          }, 300)
        })
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

      it('is called when state is updated', async function () {
        return new Promise((resolve, reject) => {
          let called = false
          subscribe(() => {
            if (called) reject()
            called = true
            setTimeout(() => resolve(), 300)
          })
          mock.sendMessage({
            __type__: SUBSCRIBE_TYPE,
            __target__: TARGET_FOREGROUND,
            __state__: {},
          })
        })
      })
    })

    describe('getState', function () {
      let getState: typeof link.getState
      let subscribe: typeof link.subscribe

      beforeEach(async function () {
        ({ getState, subscribe } = link)
      })

      it('is function on link', async function () {
        expect(getState).be.a('function')
      })

      it('should retrieve initial state', async function () {
        // act
        const state = getState()

        // assert
        expect(state).be.a('object')
        expect(state).to.have.property('value', initialState.value)
        expect(state).to.not.have.property('random')
      })

      it('should retrieve updated state', async function () {
        const updatedState = { value: 'newValue' }
        subscribe(() => {
          const state = getState()
          expect(state).have.property('value', updatedState.value)
        })
        mock.sendMessage({
          __type__: SUBSCRIBE_TYPE,
          __target__: TARGET_FOREGROUND,
          __state__: updatedState,
        })
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

      it('should throw error (not supported operation)', async function () {
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
