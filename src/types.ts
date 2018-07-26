import {
  AnyAction as ReduxAction,
  Store as ReduxStore,
  Dispatch as ReduxDispatch,
  Unsubscribe,
  AnyAction,
  Reducer,
} from 'redux'
import { ThunkAction, ThunkDispatch } from 'redux-thunk'

export type Action = ReduxAction

export type API = typeof chrome

export type Listener = () => void

export type Subscribe <S> = (this: Context<S>, listener: Listener) => Unsubscribe

export type GetState <S> = (this: Context<S>) => S

// TODO: Change to use ThunkDispatch
export type Dispatch <A extends Action> = ReduxDispatch<A>

export type ReplaceReducer <S = any, A extends Action = AnyAction> = (nextReducer: Reducer<S, A>) => void

export type Store <S, A extends Action> = ReduxStore<S, A>

export type Thunk<R, S, E, A extends Action> = ThunkAction<R, S, E, A>

export interface Thunks<P, R, S, E, A extends Action> {
  [key: string]: (payload: P) => Thunk<R, S, E, A>
}

export interface Context <S> {
  state: S
  prevState: S
  listeners: Listener[]
  sendMessage: typeof chrome.runtime.sendMessage
}

export interface ThunkDescriptor <P> {
  isThunk: true
  thunkName: string
  payload: P
}
