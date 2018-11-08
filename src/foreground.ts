import {
  DISPATCH_TYPE,
  SUBSCRIBE_TYPE,
  INIT_TYPE,
  TARGET_FOREGROUND,
  TARGET_BACKGROUND,
} from './common'
import { API, GetState, Context, Subscribe, Dispatch, Action, Store, ReplaceReducer, Reducer } from './types'

function onMessageListener <S> (this: Context<S>, message: any) {
  // Validation
  if (typeof message !== 'object') return
  if (message === null) return
  if (typeof message.__type__ !== 'string') return
  if (typeof message.__target__ !== 'string') return
  if (message.__type__ !== SUBSCRIBE_TYPE) return
  if (message.__target__ !== TARGET_FOREGROUND) return
  if (typeof message.__state__ !== 'object') return
  if (message.__state__ === null) return

  // Reassign state
  this.prevState = this.state
  this.state = message.__state__

  // Notify listeners async
  this.listeners.forEach(l => setTimeout(() => l(), 0))
}

function createDispatch <S, A extends Action> (context: Context<S>): Dispatch<A> {
  const dispatch: Dispatch<A> = function <T extends A> (this: Context<S>, action: T): T {
    this.sendMessage({
      __type__: DISPATCH_TYPE,
      __action__: action,
      __target__: TARGET_BACKGROUND,
    })

    return action
  }

  return dispatch.bind(context)
}

function createSubscribe <S> (context: Context<S>): Subscribe<S> {
  const subscribe: Subscribe<S> = function (listener) {
    this.listeners = [...this.listeners, listener]

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  return subscribe.bind(context)
}

function createGetState <S> (context: Context<S>): GetState<S> {
  const getState: GetState<S> = function (this: Context<S>) {
    return this.state
  }

  return getState.bind(context)
}

function createReplaceReducer <S, A extends Action> (): ReplaceReducer<S, A> {
  return (_: Reducer<S, A>) => {
    throw new Error('store#replaceReducer is not currently a supported operation in ext-link')
  }
}

async function createForegroundLink <S, A extends Action> (api: API): Promise<Store<S, A>> {
  let store: Store<S, A>
  const { runtime: { sendMessage, onMessage, getBackgroundPage } } = api

  const background = await new Promise<any>((resolve) => {
    getBackgroundPage(bg => resolve(bg))
  })
  if (background) {
    // For performance reasons bypass messaging if possible
    store = background.__store__
  } else {
    const initialState = await new Promise((resolve) => {
      sendMessage(
        {
          __type__: INIT_TYPE,
          __target__: TARGET_BACKGROUND,
        },
        ({ __initialState__ }) => {
          resolve(__initialState__)
        },
      )
    })

    const context: Context<S> = {
      sendMessage,
      state: initialState as S,
      prevState: {} as S,
      listeners: [],
    }

    store = {
      dispatch: createDispatch(context),
      subscribe: createSubscribe(context),
      getState: createGetState(context),
      replaceReducer: createReplaceReducer<S, A>(),
    }

    onMessage.addListener(onMessageListener.bind(context))
  }

  return store
}

export default createForegroundLink
