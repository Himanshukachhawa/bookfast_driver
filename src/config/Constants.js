import { Dimensions } from "react-native";
import strings from "../languages/strings.js";

export const app_name = "BookFast";
export const base_url = "https://bookfast.in/";
export const api_url = "https://bookfast.in/api/";
export const img_url = "https://bookfast.in/public/uploads/";

export const check_phone = "driver/check_phone";
export const login = "driver/login";
export const get_zones = "driver/get_zones"; //Verified
export const faq = "driver/faq";
export const get_notification_messages = "driver/get_notification_messages";
export const get_kyc = "driver/get_kyc";
export const update_kyc = "driver/update_kyc";
export const withdrawal_request = "driver/withdrawal_request";
export const withdrawal_history = "driver/withdrawal_history";
export const earning = "driver/earning";
export const wallet = "driver/wallet";
export const driver_tutorials = "driver_tutorials";
export const checkin = "driver/change_online_status";
export const my_bookings = "driver/my_bookings";
export const dashboard = "driver/dashboard";
export const accept = "driver/accept";
export const reject = "driver/reject";
export const status_change = "driver/change_statuses";
export const get_fare = "customer/get_fare";
export const direct_booking = "direct_booking";
export const spot_otp = "spot_booking_otp";
export const forgot = "driver/forgot_password";
export const reset_password = "driver/reset_password";
export const register = "driver/register";
export const vehicle_type_list = "vehicle_type_list";
export const vehicle_update = "vehicle_update";
export const vehicle_details = "vehicle_details";
export const add_wallet = "driver/add_wallet";
export const wallet_payment_methods = "customer/wallet_payment_methods";
export const stripe_payment = "stripe_payment";
export const get_wallet = "driver/get_wallet";
export const settings = "app_setting";
export const get_access_token = "get_access_token";
export const get_drop_addresses = "get_drop_addresses";
export const get_stops = "get_stops";
export const cancel_ride = "customer/get_cancellation_reasons";
export const trip_cancel = "driver/trip_cancel";
export const submit_rating = "driver/customer_rating";
export const shared_ride_status = "get_shared_ride_status";
export const update_shared_ride_status = "change_shared_ride_status";
export const get_ongoing_trip_details = "get_ongoing_trip_details";
export const get_shared_ongoing_trip_details =
  "get_ongoing_trip_details_shared";

//Profile
export const profile = "driver/profile";
export const profile_update = "driver/profile_update";
export const profile_picture_path = "driver/profile_image_upload";
export const profile_picture_update = "driver/profile_picture_update";
//document
export const get_documents = "driver/get_documents";
export const image_upload = "image_upload";
export const update_document = "driver/update_document";

//Size
export const screenHeight = Math.round(Dimensions.get("window").height);
export const screenWidth = Math.round(Dimensions.get("window").width);
export const height_5 = Math.round((10 / 100) * screenHeight);
export const height_10 = Math.round((10 / 100) * screenHeight);
export const height_20 = Math.round((20 / 100) * screenHeight);
export const height_30 = Math.round((30 / 100) * screenHeight);
export const height_40 = Math.round((40 / 100) * screenHeight);
export const height_50 = Math.round((50 / 100) * screenHeight);
export const height_60 = Math.round((60 / 100) * screenHeight);
export const height_70 = Math.round((70 / 100) * screenHeight);
export const height_75 = Math.round((75 / 100) * screenHeight);
export const height_35 = Math.round((35 / 100) * screenHeight);
export const width_80 = Math.round((80 / 100) * screenWidth);
export const width_100 = screenWidth;

//Path
export const splash = require(".././assets/img/splash.png");
export const signup_img = require(".././assets/img/signup_img.png");
export const bell_icon = require(".././assets/img/bell.png");
export const avatar_icon = require(".././assets/img/avatar.png");
export const wallet_icon = require(".././assets/img/wallet.png");
export const taxi_icon = require(".././assets/img/taxi.png");
export const debited_icon = require(".././assets/img/debited_icon.png");
export const upload_idproof = require(".././assets/img/id_proof_upload.png");
export const upload_document = require(".././assets/img/vehicle_image.png");
export const car_icon_small = require(".././assets/img/car_icon_small.png");
export const meter_icon = require(".././assets/img/meter.png");
export const bg_image = require(".././assets/img/bg_img.png");
export const go_icon = require(".././assets/img/go_icon.png");
export const booking_lottie = require(".././assets/json/booking.json");
export const daily = require(".././assets/img/daily.png");
export const rental = require(".././assets/img/rental.png");
export const outstation = require(".././assets/img/outstation.png");
export const duty = require(".././assets/img/duty.png");
export const logo = require(".././assets/img/logo.png");
export const call_lottie = require(".././assets/json/call.json");
export const cancel = require(".././assets/img/cancel.png");
export const india = require(".././assets/img/india.png");
export const id_proof_icon = require(".././assets/img/id_proof_icon.png");
export const vehicle_certificate_icon = require(".././assets/img/vehicle_certificate_icon.png");
export const vehicle_insurance_icon = require(".././assets/img/vehicle_insurance_icon.png");
export const vehicle_image_icon = require(".././assets/img/vehicle_image_icon.png");
export const upload_icon = require(".././assets/img/upload_icon.png");

//Map
export const GOOGLE_KEY = "AIzaSyBnms1zf32XuJ1PzAwtkuBHEyi8PaBqsh0";
export const LATITUDE_DELTA = 0.015;
export const LONGITUDE_DELTA = 0.0152;
export const DEFAULT_PADDING = { top: 40, right: 40, bottom: 40, left: 40 };

//Font Family
export const font_title = "TitilliumWeb-Bold";
export const font_description = "TitilliumWeb-Regular";

//Image upload options
const options = {
  title: "Select a photo",
  takePhotoButtonTitle: "Take a photo",
  chooseFromLibraryButtonTitle: "Choose from gallery",
};

export const alert_close_timing = 2000;

//Messages
export const login_phone_validation_error = "Please enter valid phone number";
export const login_phone_required_validation_error =
  "Please enter phone number";
export const password_required_validation_message = "Please enter password";
export const create_name_required_validation_message =
  "Please enter first name and last name";
export const create_email_required_validation_message =
  "Please enter email address";
export const create_password_required_validation_message =
  "Please enter password";
export const otp_validation_error = "Please enter valid otp";
export const forgot_phone_required_validation_error =
  "Please enter phone number";
export const forgot_phone_validation_error = "Please enter valid phone number";
export const reset_password_required_validation_message =
  "Please enter password & confirm password";
export const reset_password_missmatch_validation_message =
  "Your password and confirm password missmatch";

//More Menu
export const menus = [
  {
    menu_name: strings.vehicle_document,
    icon: "upload",
    route: "Document",
  },
  {
    menu_name: strings.profile,
    icon: "user",
    route: "Profile",
  },
  {
    menu_name: strings.kyc_verification,
    icon: "files-o",
    route: "KycVerification",
  },
  {
    menu_name: strings.training,
    icon: "user",
    route: "Training",
  },
  {
    menu_name: strings.partner_care,
    icon: "question-circle-o",
    route: "Faq",
  },
  {
    menu_name: strings.earnings,
    icon: "dollar",
    route: "Earnings",
  },
  {
    menu_name: strings.withdrawal,
    icon: "credit-card",
    route: "Withdrawal",
  },
  {
    menu_name: strings.wallet_transactions,
    icon: "money",
    route: "Wallet",
  },
  {
    menu_name: "Notification",
    icon: "bell",
    route: "Notification",
  },
  {
    menu_name: strings.logout,
    icon: "sign-out",
    route: "Logout",
  },
];
