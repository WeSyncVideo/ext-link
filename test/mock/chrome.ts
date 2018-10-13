function createMock<S> (initialState: S) {
  const mock = {
    runtime: {
      sendMessage (_: any, cb: (response: any) => void) {
        cb({
          __initialState__: initialState,
        })
      },
      onMessage: {
        addListener () {
          //
        },
        removeListener () {
          return true
        },
      },
    },
  } as any as typeof chrome

  return mock
}

export default createMock
