import { MESSAGE_TYPE, bind, TARGET_FOREGROUND, TARGET_BACKGROUND } from './common'
import { API, GetState, Context, Subscribe, Dispatch, Action, Store, ReplaceReducer } from './types'

function onMessageListener <S> (this: Context<S>, message: any) {
  if (
    typeof message === 'object' &&
    message !== null &&
    typeof message.__type__ === 'string' &&
    typeof message.__target__ === 'string' &&
    message.__type__ === MESSAGE_TYPE &&
    message.__target__ === TARGET_FOREGROUND
  ) {
    // Reassign state
    this.prevState = this.state
    this.state = message.__state__

    // Notify listeners async
    this.listeners.forEach(l => setTimeout(() => l(), 0))
  }
}

function createDispatch <S, A extends Action> (context: Context<S>): Dispatch<A> {
  const dispatch: Dispatch<A> = function <T extends A> (this: Context<S>, action: T): T {
    this.sendMessage({
      __type__: MESSAGE_TYPE,
      __action__: action,
      __target__: TARGET_BACKGROUND,
    })

    return action
  }

  return bind(context)(dispatch)
}

function createSubscribe <S> (context: Context<S>): Subscribe<S> {
  const subscribe: Subscribe<S> = function (listener) {
    this.listeners = [...this.listeners, listener]

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  return bind(context)(subscribe)
}

function createGetState <S> (context: Context<S>): GetState<S> {
  const getState: GetState<S> = function (this: Context<S>) {
    return this.state
  }

  return bind(context)(getState)
}

function createReplaceReducer <S, A extends Action> (): ReplaceReducer<S, A> {
  throw new Error('store#replaceReducer is not a supported operation in ext-link')
}

function link <S, A extends Action> (api: API): Store<S, A> {
  const { runtime: { sendMessage, onMessage } } = api
  const context: Context<S> = {
    sendMessage: bind(api)(sendMessage),
    state: {} as S,
    prevState: {} as S,
    listeners: [],
  }

  const store = {
    dispatch: createDispatch(context),
    subscribe: createSubscribe(context),
    getState: createGetState(context),
    replaceReducer: createReplaceReducer<S, A>(),
  }

  onMessage.addListener(bind(context)(onMessageListener))

  return store
}

export default link
