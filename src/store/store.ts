import { combineReducers, configureStore } from "@reduxjs/toolkit"
import { globalSlice } from "./reducers/globalReducer"

const rootReducer = combineReducers({
    global : globalSlice.reducer
})

export const setupStore = (preloadedState : Partial<typeof rootReducer>) => {
    return configureStore({
        reducer : rootReducer,
        preloadedState
    })
}

export type AppState = ReturnType<ReturnType<typeof setupStore>['getState']>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']