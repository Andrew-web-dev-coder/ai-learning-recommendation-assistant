import { configureStore } from '@reduxjs/toolkit'
import { learningApi } from '../features/learning/api'
import { frontendLogging } from './frontendLogging'
import { workflowReducer } from '../features/learning/workflowSlice'

export function createAppStore() {
  return configureStore({
    reducer: {
      workflow: workflowReducer,
      [learningApi.reducerPath]: learningApi.reducer,
    },
    middleware: (defaults) => {
      const middleware = defaults().concat(learningApi.middleware)
      return import.meta.env.DEV ? middleware.concat(frontendLogging) : middleware
    },
    // Mutation actions contain answer text while the request is in flight.
    devTools: false,
  })
}

export type AppStore = ReturnType<typeof createAppStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
