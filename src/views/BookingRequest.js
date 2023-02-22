import React, { Component } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import {
  img_url,
  api_url,
  accept,
  reject,
  font_title,
  font_description,
} from "../config/Constants";
import * as colors from "../assets/css/Colors";
import axios from "axios";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";
import strings from "../languages/strings.js";
import { CommonActions } from "@react-navigation/native";
import Loader from "../components/Loader";

var Sound = require("react-native-sound");

Sound.setCategory("Playback");

var whoosh = new Sound("uber.mp3", Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    console.log("failed to load the sound", error);
    return;
  }
  // loaded successfully
  console.log(
    "duration in seconds: " +
      whoosh.getDuration() +
      "number of channels: " +
      whoosh.getNumberOfChannels()
  );
});

class BookingRequest extends Component<Props> {
  constructor(props) {
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      customer_name: this.props.route.params.customer_name,
      pickup_address: this.props.route.params.pickup_address,
      static_map: this.props.route.params.static_map,
      drop_address: this.props.route.params.drop_address,
      fare: this.props.route.params.fare,
      trip_id: this.props.route.params.trip_id,
      trip_type: this.props.route.params.trip_type,
      isLoading: false,
      isPlaying: true,
      ad_status: true,
    };
    whoosh.play();
    whoosh.setNumberOfLoops(-1);
  }

  async componentDidMount() {
    console.log("this.props.route.params", this.props.route.params);
    this._unblur = this.props.navigation.addListener("blur", async () => {
      whoosh.stop();
    });
  }

  componentWillUnmount() {
    this._unblur();
  }

  handleBackButtonClick = () => {
    this.props.navigation.goBack(null);
  };

  accept = async () => {
    console.log({ trip_id: this.state.trip_id, driver_id: global.id });
    whoosh.stop();
    if (this.state.ad_status) {
      this.setState({ isLoading: true, isPlaying: false, ad_status: false });
      await axios({
        method: "post",
        url: api_url + accept,
        data: { trip_id: this.state.trip_id, driver_id: global.id },
      })
        .then(async (response) => {
          this.setState({ isLoading: false, ad_status: true });
          if (response.data.status == 1) {
            await this.home();
          } else {
            await alert("Sorry customer cancelled");
            await this.handleBackButtonClick();
          }
        })
        .catch((error) => {
          console.log(error?.response);
          this.setState({ isLoading: false, ad_status: true });
          alert(strings.sorry_something_went_wrong);
        });
    }
  };

  home = () => {
    this.props.navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    );
  };

  reject = async () => {
    whoosh.stop();
    if (this.state.ad_status) {
      this.setState({ isLoading: true, ad_status: false });
      await axios({
        method: "post",
        url: api_url + reject,
        data: { trip_id: this.state.trip_id, driver_id: global.id, from: 1 },
      })
        .then(async (response) => {
          this.setState({ isLoading: false, ad_status: true });
          if (response.data.status == 1) {
            this.handleBackButtonClick();
          }
        })
        .catch((error) => {
          this.setState({ isLoading: false, ad_status: true });
          alert(strings.sorry_something_went_wrong);
        });
    }
  };

  render() {
    return (
      <TouchableOpacity activeOpacity={1} onPress={this.accept}>
        <Loader visible={this.state.isLoading} />
        <View style={styles.header}>
          <Text
            style={{
              color: colors.theme_fg_three,
              fontFamily: font_title,
              fontSize: 18,
            }}
          >
            {strings.hi_new_booking_arrivd}
          </Text>
        </View>
        <View style={styles.container}>
          <Text
            style={{
              fontSize: 20,
              color: colors.theme_fg,
              fontFamily: font_title,
            }}
          >
            {strings.pickup_location}
          </Text>
          <View style={{ margin: 5 }} />
          <Text
            style={{
              fontSize: 15,
              color: colors.theme_fg_two,
              fontFamily: font_description,
            }}
          >
            {this.state.pickup_address}
          </Text>
          <View style={{ margin: 10 }} />
          <Text style={{ position: "absolute", top: 250, fontSize: 30 }}>
            {global.driver_trip_time}
          </Text>
          <CountdownCircleTimer
            isPlaying={this.state.isPlaying}
            duration={global.driver_trip_time}
            colors={["#cc0013", 0.33]}
            onComplete={() => {
              this.reject();
            }}
          >
            {() => (
              <Image
                source={{ uri: img_url + this.state.static_map }}
                style={{ height: 160, width: 160, borderRadius: 80 }}
              />
            )}
          </CountdownCircleTimer>

          <View style={{ margin: 10 }} />
          <Text
            style={{
              fontSize: 20,
              color: colors.theme_fg,
              fontFamily: font_title,
            }}
          >
            {strings.drop_location}
          </Text>
          <View style={{ margin: 5 }} />
          <Text
            style={{
              fontSize: 15,
              color: colors.theme_fg_two,
              fontFamily: font_description,
            }}
          >
            {this.state.drop_address}
          </Text>
          <View style={{ margin: 10 }} />
          <View
            style={{
              borderColor: colors.theme_fg_two,
              borderWidth: 0.5,
              width: "80%",
            }}
          />
          <View style={{ margin: 10 }} />
          {global.lang == "en" ? (
            <Text
              style={{
                fontSize: 20,
                color: colors.theme_fg_two,
                fontFamily: font_title,
              }}
            >
              {this.state.trip_type}
            </Text>
          ) : (
            <Text
              style={{
                fontSize: 20,
                color: colors.theme_fg_two,
                fontFamily: font_title,
              }}
            >
              {this.state.trip_type_ar}
            </Text>
          )}
          <Text
            style={{
              fontSize: 20,
              color: colors.theme_fg_two,
              fontFamily: font_title,
            }}
          >
            {global.currency}
            {this.state.fare}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.theme_fg_two,
              fontFamily: font_title,
            }}
          >
            ({strings.estimated_fare})
          </Text>
        </View>
        <View style={styles.footer}>
          <Text
            style={{
              color: colors.theme_fg_three,
              fontFamily: font_title,
              fontSize: 20,
            }}
          >
            {this.state.customer_name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}

export default BookingRequest;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.theme_bg_three,
    height: "86%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  header: {
    backgroundColor: colors.theme_bg,
    alignItems: "center",
    justifyContent: "center",
    height: "7%",
  },
  footer: {
    backgroundColor: colors.theme_bg,
    alignItems: "center",
    justifyContent: "center",
    height: "7%",
  },
});
