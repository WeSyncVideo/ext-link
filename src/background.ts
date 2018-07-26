import { API, Store, Action, Thunks } from './types'
import { MESSAGE_TYPE, TARGET_FOREGROUND, isThunkDescriptor } from './common'

// TODO: Consider how modules will impact thunks

function createLink <P, R, S, E, A extends Action> (api: API, store: Store<S, A>, thunks: Thunks<P, R, S, E, A>) {
  const { runtime: { sendMessage, onMessage } } = api

  store.subscribe(() => {
    const state = store.getState()
    sendMessage({
      __type__: MESSAGE_TYPE,
      __target__: TARGET_FOREGROUND,
      __state__: state,
    })
  })

  onMessage.addListener(message => {
    if (
      typeof message === 'object' &&
      message !== null &&
      typeof message.__type__ === 'string' &&
      typeof message.__target__ === 'string' &&
      typeof message.__action__ === 'object' &&
      message.__action__ !== null
    ) {
      const { action } = message
      if (isThunkDescriptor(action)) {
        store.dispatch(thunks[message.thunkName](message.payload))
      } else {
        store.dispatch(action)
      }
    }
  })
}

export default createLink
