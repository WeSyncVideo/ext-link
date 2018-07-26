import { ThunkDescriptor } from './types'

export const MESSAGE_TYPE = 'wesync::ext-link::message'

export const TARGET_FOREGROUND = 'wesync::ext-link::target::foreground'

export const TARGET_BACKGROUND = 'wesync::ext-link::target::background'

export const bind = (context: object) => (fn: Function) => (...args: any[]) => fn.call(context, ...args)

export function isThunkDescriptor (msg: any): msg is ThunkDescriptor<any> {
  return !!msg.isThunk
}
