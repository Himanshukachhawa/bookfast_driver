import * as ActionTypes from './ActionTypes';

export const kycPending = () => ({
    type: ActionTypes.KYC_PENDING
})

export const kycError = (error) => ({
    type: ActionTypes.KYC_ERROR,
    error: error
})

export const kycSuccess = (data) => ({
    type: ActionTypes.KYC_SUCCESS,
    data: data
})
