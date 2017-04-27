import * as Immutable from "immutable"

export const homeInitialState = {
    "assigned-to": {
        epics:[],
        userstories:[],
        tasks:[],
        issues:[],
    },
    "watching": {
        epics:[],
        userstories:[],
        tasks:[],
        issues:[],
    },
}

export const homeReducer = (state, action) => {
    switch(action.type){
        case 'SET_ASSIGNED_TO':
            return state.set('assigned-to', action.payload);
        case 'SET_WATCHING':
            return state.set('watching', action.payload);
        default:
            return state;
    }
};