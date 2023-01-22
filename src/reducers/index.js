import { combineReducers } from 'redux';

import FaqReducer from './FaqReducer.js';
import PrivacyReducer from './PrivacyReducer.js';
import CheckPhoneReducer from './CheckPhoneReducer.js';
import LoginReducer from './LoginReducer.js';
import ProfileReducer from './ProfileReducer.js';
import WalletReducer from './WalletReducer.js';
import NotificationReducer from './NotificationReducer.js';
import KycReducer from './KycReducer.js';
import EarningsReducer from './EarningsReducer.js';
import WithdrawalReducer from './WithdrawalReducer.js';
import RegisterReducer from './RegisterReducer.js';
import BookingReducer from './BookingReducer.js';
const allReducers = combineReducers({
  faq:FaqReducer,
  privacy:PrivacyReducer,
  check_phone:CheckPhoneReducer,
  login:LoginReducer,
  profile:ProfileReducer,
  wallet:WalletReducer,
  notification:NotificationReducer,
  kyc:KycReducer,
  earnings:EarningsReducer,
  withdraw:WithdrawalReducer,
  register:RegisterReducer,
  booking:BookingReducer,
});

export default allReducers;