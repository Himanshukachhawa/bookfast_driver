import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  isEnabled,
  PermissionsAndroid,
  I18nManager,
  Platform,
} from "react-native";
import {
  font_title,
  font_description,
  height_20,
  height_70,
  LATITUDE_DELTA,
  LONGITUDE_DELTA,
  checkin,
  api_url,
  dashboard,
  app_name,
} from "../config/Constants";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import * as colors from "../assets/css/Colors";
import Geolocation from "@react-native-community/geolocation";
import FusedLocation from "react-native-fused-location";
import database from "@react-native-firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { StatusBar } from "../components/GeneralComponents";
import strings from "../languages/strings.js";
import RNRestart from "react-native-restart";
import Heartbeat from "../../Heartbeat";
import Icon, { Icons } from "../components/Icons";
import { TouchableOpacity } from "react-native-gesture-handler";
export default class Duty extends Component<props> {
  _isMounted = false;
  constructor() {
    super();
    this.state = {
      switch2Value: false,
      switch1Value: global.live_status == 1 ? true : false,
      isLoading: false,
      today_bookings: 0,
      today_earnings: 0,
      vehicle_type: 0,
      language: global.lang,
      _isMounted: false,
    };
  }

  async componentDidMount() {
    this._unsubscribe = await this.props.navigation.addListener(
      "focus",
      async () => {
        this.setState({ _isMounted: true });
        await this.dashboard();
      }
    );
    if (Platform.OS === "android") {
      await this.requestCameraPermission();
    } else {
      await this.getInitialLocation();
    }
    await this.get_location();
    this.booking_sync();
  }

  toggleSwitch1 = (value) => {
    this.setState({ switch2Value: value });

    console.log("value", value);
    this.status_change1(value ? 1 : 0);
  };

  toggleSwitch = (value) => {
    if (value) {
      this.setState({ switch1Value: value });
      this.status_change(1);
      this.saveData(1);
      global.live_status = 1;
      //Heartbeat.startService()
    } else {
      this.setState({ switch1Value: value });
      global.live_status = 0;
      this.status_change(0);
      this.saveData(0);
      //Heartbeat.stopService()
    }
  };

  saveData = async (status) => {
    try {
      await AsyncStorage.setItem("online_status", status.toString());
    } catch (e) {}
  };

  dashboard = async () => {
    this.setState({ isLoading: true });
    await axios({
      method: "post",
      url: api_url + dashboard,
      data: { id: global.id },
    })
      .then(async (response) => {
        console.log(response.data.result);
        this.setState({
          isLoading: false,
          today_bookings: response.data.result.today_bookings,
          today_earnings: response.data.result.today_earnings,
        });
      })
      .catch((error) => {
        this.setState({ isLoading: false });
      });
  };

  status_change1 = async (status) => {
    this.setState({ isLoading: true });
    await axios({
      method: "post",
      url: api_url + checkin,
      data: {
        id: global.id,
        outstation_booking_status: status,
        online_status: this.state.switch1Value ? 1 : 0,
      },
    })
      .then(async (response) => {
        console.log("checking", response?.data);
        this.setState({ isLoading: false });
        if (response.data.status == 0) {
          alert(response.data.message);
          this.setState({ switch2Value: false });

          //this.saveData(0);
        }
      })
      .catch((error) => {
        console.log("error", error?.response);
        this.setState({ isLoading: false });
      });
  };
  status_change = async (status) => {
    this.setState({ isLoading: true });
    await axios({
      method: "post",
      url: api_url + checkin,
      data: { id: global.id, online_status: status },
    })
      .then(async (response) => {
        console.log("checking", response?.data);
        this.setState({ isLoading: false });
        if (response.data.status == 0) {
          alert(response.data.message);
          this.setState({ switch1Value: false });
          global.live_status == 0;
          this.saveData(0);
        }
      })
      .catch((error) => {
        this.setState({ isLoading: false });
      });
  };

  componentWillUnmount() {
    this._unsubscribe();
    this.setState({ _isMounted: false });
  }

  async get_background_location_permission() {
    const bg_granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
      {
        title: app_name + " " + strings.location_access_required,
        message: strings.We_needs_to_Access_your_location_for_tracking,
        buttonPositive: "OK",
      }
    );
  }

  async requestCameraPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: app_name + " " + strings.location_access_required,
          message: strings.We_needs_to_Access_your_location_for_tracking,
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        await this.get_background_location_permission();
        await this.getInitialLocation();
      }
    } catch (err) {
      alert(strings.sorry_cannot_fetch_your_location);
    }
  }

  booking_sync = () => {
    try {
      database()
        .ref(
          `${global.country_id}/drivers/${global.vehicle_type}/${global.zone}/${global.id}`
        )
        .on("value", (snapshot) => {
          if (this.state._isMounted) {
            var status = 1;
            if (
              snapshot.val().booking?.booking_status &&
              snapshot.val().booking?.booking_status != null &&
              snapshot.val().booking?.booking_status != undefined
            ) {
              status = snapshot.val().booking.booking_status;
            } else {
              status = 1;
            }
            if (status == 1 && snapshot.val().online_status == 1) {
              this.setState({ _isMounted: false });
              this.props.navigation.navigate("BookingRequest", {
                customer_name: snapshot.val().booking.customer_name,
                trip_id: snapshot.val().booking.booking_id,
                pickup_address: snapshot.val().booking.pickup_address,
                fare: snapshot.val().booking.total,
                drop_address: snapshot.val().booking.drop_address,
                static_map: snapshot.val().booking.static_map,
                trip_type: snapshot.val().booking.trip_type,
              });
            } else if (
              status == 2 &&
              snapshot.val().online_status == 1 &&
              snapshot.val().booking.trip_type != "Shared"
            ) {
              this.setState({ _isMounted: false });
              this.props.navigation.navigate("Trip", {
                trip_id: snapshot.val().booking.booking_id,
                customer_name: snapshot.val().booking.customer_name,
              });
            } else if (
              status == 2 &&
              snapshot.val().online_status == 1 &&
              snapshot.val().booking.trip_type == "Shared"
            ) {
              this.setState({ _isMounted: false });
              this.props.navigation.navigate("SharedTrip", {
                trip_id: snapshot.val().booking.booking_id,
                customer_name: snapshot.val().booking.customer_name,
                driver_id: snapshot.val().driver_id,
                lat: this.state.lat,
                lng: this.state.long,
              });
            }
          }
        });
    } catch (e) {
      console.log(e);
    }
  };

  async get_location() {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title:
          { app_name } +
          "access your location for location for get nearest trip requests",
        message:
          { app_name } +
          " needs to access your location for get nearest trips, show live location to customers that will be always in use",
      }
    );

    if (granted) {
      console.log("get_location");
      FusedLocation.setLocationPriority(FusedLocation.Constants.HIGH_ACCURACY);

      // Get location once.
      const location = await FusedLocation.getFusedLocation();
      console.log("location", location);
      this.setState({ lat: location.latitude, long: location.longitude });

      // Set options.
      FusedLocation.setLocationPriority(FusedLocation.Constants.BALANCED);
      FusedLocation.setLocationInterval(5000);
      FusedLocation.setFastestLocationInterval(5000);
      FusedLocation.setSmallestDisplacement(10);

      // Keep getting updated location.
      FusedLocation.startLocationUpdates();

      // Place listeners.
      this.subscription = FusedLocation.on(
        "fusedLocation",
        async (location) => {
          let region = {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          };

          let marker = {
            latitude: location.latitude,
            longitude: location.longitude,
          };

          let lat = location.latitude;
          let lng = location.longitude;

          let bearing = 0;
          if (!isNaN(location.bearing)) {
            bearing = location.bearing;
          }
          console.log(
            "updpate firebase",
            global.country_id,
            global.vehicle_type,
            global.zone,
            global.id
          );
          if (location) {
            database()
              .ref(
                `${global.country_id}/drivers/${global.vehicle_type}/${global.zone}/${global.id}/geo`
              )
              .update({
                lat: lat,
                lng: lng,
                bearing: bearing,
              });
          }
        }
      );
    }
  }

  async getInitialLocation() {
    Geolocation.getCurrentPosition(
      async (position) => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        let region = {
          latitude: await position.coords.latitude,
          longitude: await position.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        };
        this.setState({ mapRegion: region });
      },
      (error) => this.getInitialLocation(),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  get_header_bg(val) {
    if (val) {
      return { backgroundColor: colors.theme_bg };
    } else {
      return { backgroundColor: colors.theme_bg_two };
    }
  }

  language_change = async (lang) => {
    try {
      await AsyncStorage.setItem("lang", lang);
      strings.setLanguage(lang);
      if (lang == "ar") {
        I18nManager.forceRTL(true);
        RNRestart.Restart();
      } else {
        I18nManager.forceRTL(false);
        RNRestart.Restart();
      }
    } catch (e) {}
  };

  shared_settings = () => {
    this.props.navigation.navigate("SharedSettings");
  };

  render() {
    return (
      <View>
        <StatusBar />
        <View style={styles.map_container}>
          <MapView
            provider={PROVIDER_GOOGLE}
            showsUserLocation={true}
            style={styles.map}
            showsMyLocationButton={false}
            region={this.state.mapRegion}
          ></MapView>
          <View
            style={{
              position: "absolute",
              top: 10,
              width: "90%",
              marginLeft: "5%",
            }}
          >
            <TouchableOpacity
              onPress={this.shared_settings.bind(this)}
              style={{
                width: "100%",
                alignItems: "flex-end",
                justifyContent: "flex-end",
              }}
            >
              <Icon
                type={Icons.Ionicons}
                name="settings"
                style={{ fontSize: 30, color: colors.theme_fg }}
              />
            </TouchableOpacity>
            <View style={{ margin: 5 }} />
            <View
              style={[
                styles.header,
                this.get_header_bg(this.state.switch1Value),
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  paddingRight: 5,
                  paddingLeft: 2,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.theme_fg_three,
                    fontFamily: font_title,
                  }}
                >
                  {strings.off_duty}
                </Text>
                <View style={{ margin: 5 }} />
                <Switch
                  trackColor={{ false: "#C0C0C0", true: "#fcdb00" }}
                  thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={this.toggleSwitch}
                  value={this.state.switch1Value}
                />
                <View style={{ margin: 5 }} />
                <Text
                  style={{
                    fontSize: 14,
                    color: "#FFFFFF",
                    fontFamily: font_title,
                  }}
                >
                  {strings.on_duty}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  paddingLeft: 5,
                  borderLeftColor: "white",
                  borderLeftWidth: 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.theme_fg_three,
                    fontFamily: font_title,
                  }}
                >
                  {strings.intown}
                </Text>
                <View style={{ margin: 5 }} />
                <Switch
                  trackColor={{ false: "#C0C0C0", true: "#fcdb00" }}
                  thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={this.toggleSwitch1}
                  value={this.state.switch2Value}
                />
                <View style={{ margin: 2 }} />
                <Text
                  style={{
                    fontSize: 14,
                    color: "#FFFFFF",
                    fontFamily: font_title,
                  }}
                >
                  {strings.outtown}
                </Text>
              </View>
              <View style={{ margin: 10 }} />
            </View>
            <View
              style={{
                flexDirection: "row",
                height: 100,
                backgroundColor: colors.theme_bg_three,
              }}
            >
              <View
                style={{
                  width: "50%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: font_title,
                    fontSize: 16,
                    color: colors.theme_fg_four,
                  }}
                >
                  {strings.bookings_count}
                </Text>
                <View style={{ margin: 4 }} />
                <Text
                  style={{
                    fontFamily: font_description,
                    fontSize: 15,
                    color: colors.theme_fg_four,
                  }}
                >
                  {this.state.today_bookings}
                </Text>
              </View>

              <View
                style={{
                  width: "50%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  onPress={() => {
                    this.props.navigation.navigate("Bookings");
                  }}
                  style={{
                    fontFamily: font_title,
                    fontSize: 16,
                    color: colors.theme_fg_four,
                  }}
                >
                  {strings.ride_earnings}
                </Text>
                <View style={{ margin: 4 }} />
                <Text
                  onPress={() => {
                    this.props.navigation.navigate("Bookings");
                  }}
                  style={{
                    fontFamily: font_description,
                    fontSize: 15,
                    color: colors.theme_fg_four,
                  }}
                >
                  {global.currency}
                  {this.state.today_earnings}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  map_container: {
    height: "100%",
    width: "100%",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  header: {
    height: 50,
    alignItems: "center",

    flexDirection: "row",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
});
