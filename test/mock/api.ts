interface Mock {
  api: typeof chrome
  messages: any[]
  flush (): void
  prepareResponse (r: any): void
  sendMessage (m: any): void
}

function createMock (): Mock {
  let listeners = [] as any[]
  let messages = [] as any[]
  let response: any

  const api = {
    runtime: {
      sendMessage (msg: any, cb: (response: any) => void) {
        if (response) {
          setTimeout(() => {
            cb(response)
            response = undefined
          }, 0)
        }
        messages.push(msg)
      },
      onMessage: {
        addListener (listener: any) {
          listeners.push(listener)
        },
        removeListener (listener: any) {
          listeners = listeners.filter(l => l !== listener)
        },
      },
    },
  } as any as typeof chrome

  return {
    api,
    flush () {
      listeners = []
      messages = []
      response = undefined
    },
    prepareResponse (r: any) {
      response = r
    },
    sendMessage (m: any) {
      setTimeout(() => {
        listeners.forEach(l => l(m))
      }, 0)
    },
    get messages () {
      return messages
    },
  }
}

export { Mock }
export default createMock
