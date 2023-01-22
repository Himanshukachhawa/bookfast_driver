import * as Actions from '../actions/ActionTypes'
const BookingReducer = (state = { vehicle_type:0 }, action) => {
    switch (action.type) {
        case Actions.UPDATE_VEHICLE_TYPE:
          return Object.assign({}, state, {
            vehicle_type: action.data,
          });
        default:
            return state;
    }
}

export default BookingReducer;