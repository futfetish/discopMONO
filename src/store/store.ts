import { configureStore } from "@reduxjs/toolkit"
import { globalSlice } from "./reducers/globalReducer"


export const setupStore = () => {
    return configureStore({
        reducer : {
            global : globalSlice.reducer
        }
    })
}

export type AppState = ReturnType<ReturnType<typeof setupStore>['getState']>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']