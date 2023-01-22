import * as Actions from '../actions/ActionTypes';
import { img_url } from '../config/Constants';

const NotificationReducer = (state = { isLoding: false, error: undefined, data:[], message:undefined, status:undefined }, action) => {
    switch (action.type) {
        case Actions.NOTIFICATION_LIST_PENDING:
            return Object.assign({}, state, {
               isLoding: true,
               data: [],
            });
        case Actions.NOTIFICATION_LIST_ERROR:
            return Object.assign({}, state, {
                isLoding: false,
                error: action.error
            });
        case Actions.NOTIFICATION_LIST_SUCCESS:
        let data = action.data.result; 
            return Object.assign({}, state, {
                isLoding: false,
                status: action.data.status,
                message: action.data.message,
                data: data,
            });
        default:
            return state;
    }
}

export default NotificationReducer;
