import { combineReducers, configureStore } from "@reduxjs/toolkit"
import { globalReducer } from "./reducers/globalReducer"


const rootReducer = combineReducers({
    global : globalReducer
})

export const setupStore = (preloadedState : Partial<typeof rootReducer>) => {
    return configureStore({
        reducer : rootReducer,
        preloadedState
    })
}

export type AppState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']