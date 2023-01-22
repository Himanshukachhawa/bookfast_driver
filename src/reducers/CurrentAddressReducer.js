import * as Actions from '../actions/ActionTypes'
const CurrentAddressReducer = (state = { current_address: undefined, current_lat: 0, current_lng: 0 }, action) => {

    switch (action.type) {
        case Actions.UPDATE_CURRENT_ADDRESS:
            return Object.assign({}, state, {
                current_address: action.data
            });
        case Actions.UPDATE_CURRENT_LAT:
            return Object.assign({}, state, {
                current_lat: action.data
            });
        case Actions.UPDATE_CURRENT_LNG:
            return Object.assign({}, state, {
                current_lng: action.data
            });

        default:
            return state;
    }
}

export default CurrentAddressReducer;
