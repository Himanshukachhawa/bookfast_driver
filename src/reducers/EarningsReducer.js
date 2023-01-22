import * as Actions from '../actions/ActionTypes';

const EarningsReducer = (state = { isLoding: false, error: undefined, data:undefined,  message:undefined, status:undefined }, action) => {
    switch (action.type) {
        case Actions.EARNINGS_PENDING:
            return Object.assign({}, state, {
               isLoding: true,
               data:undefined
            });
        case Actions.EARNINGS_ERROR:
            return Object.assign({}, state, {
                isLoding: false,
                error: action.error
            });
        case Actions.EARNINGS_SUCCESS:
          return Object.assign({}, state, {
            isLoding: false,
            status: action.data.status,
            message: action.data.message,
            data: action.data.result,
          });
        default:
            return state;
    }
}

export default EarningsReducer;