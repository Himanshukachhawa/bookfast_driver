import * as ActionTypes from './ActionTypes';

export const updateCurrentAddress = (data) => ({

    type: ActionTypes.UPDATE_CURRENT_ADDRESS,
    data: data
})

export const updateCurrentLat = (data) => ({
    type: ActionTypes.UPDATE_CURRENT_LAT,
    data: data
})

export const updateCurrentLng = (data) => ({
    type: ActionTypes.UPDATE_CURRENT_LNG,
    data: data
})
