import * as ActionTypes from './ActionTypes';

export const withdrawActionPending = () => ({
    type: ActionTypes.WITHDRAW_ACTION_PENDING
})

export const withdrawActionError = (error) => ({
    type: ActionTypes.WITHDRAW_ACTION_ERROR,
    error: error
})

export const withdrawActionSuccess = (data) => ({
    type: ActionTypes.WITHDRAW_ACTION_SUCCESS,
    data: data
})
