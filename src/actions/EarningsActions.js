import * as ActionTypes from './ActionTypes';

export const earningsPending = () => ({
    type: ActionTypes.EARNINGS_PENDING
})

export const earningsError = (error) => ({
    type: ActionTypes.EARNINGS_ERROR,
    error: error
})

export const earningsSuccess = (data) => ({
    type: ActionTypes.EARNINGS_SUCCESS,
    data: data
})
