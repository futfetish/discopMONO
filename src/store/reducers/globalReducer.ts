import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface GlobalState {
    page : string;
}

const initialState : GlobalState = {
    page : ''
}

export const globalSlice = createSlice({
    name : 'global',
    initialState,
    reducers : {
        setPage(state , action : PayloadAction<string>){
            state.page = action.payload
        }
    }
}) 