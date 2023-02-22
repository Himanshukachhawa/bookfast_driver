import React, { Component } from "react";
import {
  View,
  StyleSheet,
  Text,
  StatusBar,
  Image,
  I18nManager,
  AppState,
  Platform,
} from "react-native";
import RNAndroidLocationEnabler from "react-native-android-location-enabler";
import {
  logo,
  font_title,
  settings,
  api_url,
  signup_img,
} from "../config/Constants";
import * as colors from "../assets/css/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import strings from "../languages/strings.js";
import axios from "axios";
import BackgroundTimer from "react-native-background-timer";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification, { Importance } from "react-native-push-notification";

export default class Splash extends Component<Props> {
  constructor() {
    super();
    this.state = {
      appState: AppState.currentState,
      previousAppStates: [],
      memoryWarnings: 0,
      timer_id: 0,
    };
  }

  async componentDidMount() {
    if (Platform.OS == "android") {
      this.configure();
      this.channel_create();
      this.settings();
    } else {
      global.fcm_token = "123456";
      this.settings();
    }
  }

  channel_create = () => {
    PushNotification.createChannel(
      {
        channelId: "taxi_booking", // (required)
        channelName: "Booking", // (required)
        channelDescription: "Taxi Booking Solution", // (optional) default: undefined.
        playSound: true, // (optional) default: true
        soundName: "uber.mp3", // (optional) See `soundName` parameter of `localNotification` function
        importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
        vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
      },
      (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
    );
  };

  configure = () => {
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        console.log("TOKEN:", token);
        global.fcm_token = token.token;
      },

      // (required) Called when a remote is received or opened, or local notification is opened
      onNotification: function (notification) {
        console.log("NOTIFICATION:", notification);

        // process the notification

        // (required) Called when a remote is received or opened, or local notification is opened
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },

      // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
      onAction: function (notification) {
        console.log("ACTION:", notification.action);
        console.log("NOTIFICATION:", notification);

        // process the action
      },

      // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
      onRegistrationError: function (err) {
        console.error(err.message, err);
      },

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       * - if you are not using remote notification or do not have Firebase installed, use this:
       *     requestPermissions: Platform.OS === 'ios'
       */
      requestPermissions: true,
    });
  };

  _handleMemoryWarning = () => {
    this.setState({ memoryWarnings: this.state.memoryWarnings + 1 });
  };

  _handleAppStateChange = async (appState) => {
    var previousAppStates = await this.state.previousAppStates.slice();
    previousAppStates.push(this.state.appState);
    this.setState({
      appState,
      previousAppStates,
    });
    if (appState === "active") {
      console.log("foreground");
      BackgroundTimer.clearTimeout(this.state.timer_id);
      // this condition calls when app goes in background mode
      // here you can detect application is in background, and you can pause your video
    } else if (appState === "background") {
      console.log("background");
      const timeoutId = BackgroundTimer.setTimeout(() => {
        console.log("tac");
      }, 1000);
      this.setState({ timer_id: timeoutId });
      // this condition calls when app is in foreground mode
      // here you can detect application is in active state again,
      // and if you want you can resume your video
    }
  };

  getToken = async () => {
    //get the messeging token
    let fcmToken = await AsyncStorage.getItem("fcmToken");
    if (!fcmToken) {
      let fcmToken = await notifications.getToken();
      if (fcmToken) {
        try {
          AsyncStorage.setItem("fcmToken", fcmToken);
          global.fcm_token = fcmToken;
        } catch (e) {}
      }
    } else {
      global.fcm_token = fcmToken;
    }
  };

  async login() {
    if (Platform == "android") {
      RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
        interval: 10000,
        fastInterval: 5000,
      })
        .then((data) => {
          this.props.navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "LoginHome" }],
            })
          );
        })
        .catch((err) => {});
    } else {
      this.props.navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "LoginHome" }],
        })
      );
    }
  }

  settings = async () => {
    await axios({
      method: "get",
      url: api_url + settings,
    })
      .then(async (response) => {
        console.log(response.data.result);
        this.home(response.data.result);
      })
      .catch((error) => {
        alert(strings.sorry_something_went_wrong);
      });
  };

  home = async (data) => {
    const id = await AsyncStorage.getItem("id");
    const first_name = await AsyncStorage.getItem("first_name");
    const phone_with_code = await AsyncStorage.getItem("phone_with_code");
    const email = await AsyncStorage.getItem("email");
    const country_id = await AsyncStorage.getItem("country_id");
    const currency = await AsyncStorage.getItem("currency");
    global.live_status = await AsyncStorage.getItem("online_status");
    const profile_picture = await AsyncStorage.getItem("profile_picture");
    const vehicle_status = await AsyncStorage.getItem("vehicle_status");
    const driver_approved_status = await AsyncStorage.getItem(
      "driver_approved_status"
    );
    const lang = await AsyncStorage.getItem("lang");
    const currency_short_code = await AsyncStorage.getItem(
      "currency_short_code"
    );
    const wallet = await AsyncStorage.getItem("wallet");
    const zone = await AsyncStorage.getItem("zone");
    const vehicle_type = await AsyncStorage.getItem("vehicle_type");
    const vehicle_id = await AsyncStorage.getItem("vehicle_id");
    global.stripe_key = data.stripe_key;
    global.razorpay_key = data.razorpay_key;
    global.app_name = data.app_name;
    global.language_status = data.language_status;
    global.default_language = data.default_language;
    global.polyline_status = data.polyline_status;
    global.driver_trip_time = data.driver_trip_time;
    global.paystack_public_key = await data.paystack_public_key;
    global.paystack_secret_key = await data.paystack_secret_key;
    global.flutterwave_public_key = await data.flutterwave_public_key;
    global.mode = data.mode;
    if (global.language_status == 1) {
      global.lang = await global.default_language;
    }

    if (lang) {
      strings.setLanguage(lang);
      global.lang = await lang;
    } else {
      strings.setLanguage("en");
      global.lang = await "en";
    }

    if (global.lang == "en" && I18nManager.isRTL) {
      I18nManager.forceRTL(false);
      await RNRestart.Restart();
    }

    if (global.lang == "ar" && !I18nManager.isRTL) {
      I18nManager.forceRTL(true);
      await RNRestart.Restart();
    }

    if (id !== null) {
      global.id = id;
      global.first_name = first_name;
      global.phone_with_code = phone_with_code;
      global.email = email;
      global.country_id = country_id;
      global.currency = currency;
      global.profile_picture = profile_picture;
      global.driver_approved_status = driver_approved_status;
      global.currency_short_code = currency_short_code;
      global.wallet = wallet;
      global.zone = zone;
      global.vehicle_type = vehicle_type;
      global.vehicle_id = vehicle_id;
      this.navigate_home();
    } else {
      global.id = "";
      this.login();
    }
  };

  navigate_home = () => {
    this.props.navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    );
  };

  render() {
    return (
      <View
        style={{
          backgroundColor: colors.theme_bg_three,
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          width: "100%",
          paddingHorizontal: 20,
        }}
      >
        <StatusBar />
        <Image style={styles.image} source={logo} resizeMode={"contain"} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  image: {
    height: "50%",
    width: "100%",
    resizeMode: "contain",
  },
});
