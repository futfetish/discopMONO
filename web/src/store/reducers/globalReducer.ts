import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { userType } from "~/types/user";

interface GlobalState {
    page : string;
    user : userType;
}

const initialState : GlobalState = {
    page : '',
    user : {name : '' , uniqName : '' , image : '' , id : ''}
}

const globalSlice = createSlice({
    name : 'global',
    initialState,
    reducers : {
        setPage(state , action : PayloadAction<string>){
            state.page = action.payload
        }
    }
}) 

export const globalReducer = globalSlice.reducer
export const { setPage } = globalSlice.actions