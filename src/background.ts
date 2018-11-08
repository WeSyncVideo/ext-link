import { API, Store, Action } from './types'
import {
  INIT_TYPE,
  SUBSCRIBE_TYPE,
  DISPATCH_TYPE,
  TARGET_FOREGROUND,
  TARGET_BACKGROUND,
} from './common'

function createLink <S, A extends Action> (api: API, store: Store<S, A>) {
  const { runtime: { sendMessage, onMessage } } = api

  // Setup store on window for bypass
  ;(window as any).__store__ = {
    dispatch: store.dispatch,
    subscribe: store.subscribe,
    getState: store.getState,
    replaceReducer () {
      throw new Error('store#replaceReducer is not currently a supported operation in ext-link')
    },
  }

  store.subscribe(() => {
    const state = store.getState()
    sendMessage({
      __type__: SUBSCRIBE_TYPE,
      __target__: TARGET_FOREGROUND,
      __state__: state,
    })
  })

  onMessage.addListener((message, _, sendResponse) => {
    if (typeof message !== 'object') return
    if (message === null) return
    if (typeof message.__type__ !== 'string') return
    if (typeof message.__target__ !== 'string') return
    if (message.__target__ !== TARGET_BACKGROUND) return
    if (typeof message.__action__ !== 'object') return
    if (message.__action__ === null) return

    switch (message.__type__) {
      case DISPATCH_TYPE: {
        const { __action__ } = message
        store.dispatch(__action__)
        break
      }
      case INIT_TYPE: {
        const initialState = store.getState()
        sendResponse({
          __initialState__: initialState,
        })
        break
      }
      default: break
    }
  })
}

export default createLink
