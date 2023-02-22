import React, { Component } from "react";
import {
  StyleSheet,
  Image,
  Text,
  View,
  TouchableOpacity,
  PermissionsAndroid,
  Dimensions,
  Linking,
  Platform,
  AppState,
  FlatList,
  SafeAreaView,
  ScrollView,
} from "react-native";
import * as colors from "../assets/css/Colors";
import StarRating from "react-native-star-rating";

import {
  font_title,
  font_description,
  get_ongoing_trip_details,
  LATITUDE_DELTA,
  LONGITUDE_DELTA,
  img_url,
  status_change,
  get_stops,
  api_url,
  GOOGLE_KEY,
  alert_close_timing,
  get_drop_addresses,
  trip_cancel,
  cancel_ride,
} from "../config/Constants";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Geolocation from "@react-native-community/geolocation";
import FusedLocation from "react-native-fused-location";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import database from "@react-native-firebase/database";
import { Divider, Badge } from "react-native-elements";
import Moment from "moment";
import axios from "axios";
import { CommonActions } from "@react-navigation/native";
import DialogInput from "react-native-dialog-input";
import strings from "../languages/strings.js";
import PolylineDirection from "@react-native-maps/polyline-direction";
import DropdownAlert from "react-native-dropdownalert";
import Dialog, {
  DialogTitle,
  SlideAnimation,
  DialogContent,
  DialogFooter,
  DialogButton,
} from "react-native-popup-dialog";
import Loader from "../components/Loader";
import RNLocation from "react-native-location";

class Trip extends Component<Props> {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      support_icon: "",
      support_contact: "",
      confiramtion_modal: false,
      trip_id: this.props.route.params.trip_id,
      customer_name: "",
      data: undefined,
      isLoading: false,
      pickup_statuses: [1, 2],
      drop_statuses: [3, 4],
      isDialogVisible: false,
      active_location: "FROM_LOCATION",
      pickup_address: "",
      pickup_lat: "",
      pickup_lng: "",
      phone_number: "",
      stops: [],
      live_location: {
        latitude: 0,
        longitude: 0,
      },
      _isMounted: false,
      appState: AppState.currentState,
      msg_state: 0,
      cancel_reason: [],
    };
    this.mapRef = null;
  }

  createMarker(lat, lng) {
    return {
      latitude: lat,
      longitude: lng,
    };
  }

  async show_message(message) {
    this.dropDownAlertRef.alertWithType("success", "New Message", message);
  }

  async componentDidMount() {
    this.setState({ _isMounted: true });
    if (Platform.OS == "android") {
      this.requestCameraPermission();
    } else {
      this.getInitialLocation();
    }
    if (Platform.OS == "android") {
      this.get_android_location();
    } else {
      this.get_ios_location();
    }
    this.get_trip_details();
    this.set_location();
    this.get_stops();
    this.cancel_ride();
    setTimeout(() => {
      this.setState({ msg_state: 1 });
    }, 1000);
    this._unsubscribe = await this.props.navigation.addListener(
      "focus",
      async () => {
        this.setState({ _isMounted: true });
      }
    );
    AppState.addEventListener("change", this._handleAppStateChange);
  }

  set_location() {
    if (
      this.state.pickup_address == "" &&
      this.state.active_location == "FROM_LOCATION"
    ) {
      //this.requestCameraPermission();
    } else if (
      this.state.pickup_address != "" &&
      this.state.active_location == "FROM_LOCATION"
    ) {
      this.mapRef.animateToCoordinate(
        {
          latitude: this.state.pickup_lat,
          longitude: this.state.pickup_lng,
        },
        1000
      );
    }
  }

  get_trip_details = async () => {
    this.setState({ isLoading: true });
    await axios({
      method: "post",
      url: api_url + get_ongoing_trip_details,
      data: { trip_id: this.state.trip_id },
    })
      .then(async (response) => {
        this.setState({
          isLoading: false,
          data: response.data.result,
          support_icon: response?.data?.support[0]?.image,
          support_contact: response?.data?.support[0]?.phone_number,
          confiramtion_modal: response.data.result?.status == 4 ? true : false,
        });
        console.log("Sssss", response);
        if (response.data.result.status == 5) {
          this.props.navigation.navigate("Rating", {
            data: response.data.result,
          });
          //this.home();
        }
        if (response.data.result.status == 6) {
          //this.localNotification("Cancelled","Sorry your booking is cancelled");
          this.home();
        }
        //this.setState({ live_location: marker });
      })
      .catch((error) => {
        alert(strings.sorry_something_went_wrong);
        this.setState({ isLoading: false });
      });
  };

  home = async () => {
    this.setState({ _isMounted: false });
    this.props.navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    );
  };

  componentWillUnmount() {
    this.setState({ _isMounted: false });
    this._unsubscribe();
    AppState.removeEventListener("change", this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    this.setState({ appState: nextAppState });
    if (nextAppState === "background") {
      // Do something here on app background.
      //this.localNotification("Hi, Your ride is on the way","Please stay in the application");
    }

    if (nextAppState === "active") {
    }

    if (nextAppState === "inactive") {
      //this.localNotification();
    }
  };

  async requestCameraPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: strings.location_access_required,
          message:
            { app_name } + strings.needs_to_Access_your_location_for_tracking,
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        await this.getInitialLocation();
      } else {
        alert(strings.sorry_cannot_fetch_your_location);
      }
    } catch (err) {
      alert(strings.sorry_cannot_fetch_your_location);
    }
  }

  async get_android_location() {
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
      FusedLocation.setLocationPriority(FusedLocation.Constants.HIGH_ACCURACY);

      // Get location once.
      const location = await FusedLocation.getFusedLocation();
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

          if (location) {
            database().ref(`trips/${this.state.trip_id}`).update({
              driver_lat: lat,
              driver_lng: lng,
              bearing: bearing,
            });
          }

          this.setState({ lat: lat, lng: lng });
          this.onRegionChange();
        }
      );
    }
  }

  get_ios_location = () => {
    RNLocation.configure({
      distanceFilter: 5.0,
    });

    RNLocation.requestPermission({
      ios: "whenInUse",
      android: {
        detail: "coarse",
      },
    }).then((granted) => {
      if (granted) {
        this.locationSubscription = RNLocation.subscribeToLocationUpdates(
          (locations) => {
            let region = {
              latitude: locations[0].latitude,
              longitude: locations[0].longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            };

            let marker = {
              latitude: locations[0].latitude,
              longitude: locations[0].longitude,
            };

            let lat = locations[0].latitude;
            let lng = locations[0].longitude;
            let bearing = 0;
            if (!isNaN(locations[0].altitude)) {
              bearing = locations[0].altitude;
            }

            if (locations[0]) {
              database().ref(`trips/${this.state.trip_id}`).update({
                driver_lat: lat,
                driver_lng: lng,
                bearing: bearing,
              });
            }
            this.setState({
              lat: locations[0].latitude,
              lng: locations[0].longitude,
            });
            this.onRegionChange();
          }
        );
      }
    });
  };

  async getInitialLocation() {
    Geolocation.getCurrentPosition(
      async (position) => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        let region = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        };
        this.setState({ mapRegion: region });
      },
      (error) => console.log(error),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  check_otp = () => {
    if (this.state.data.new_status == 3) {
      this.setState({ isDialogVisible: true });
    } else {
      this.status_change();
    }
  };

  showDialog = (val) => {
    this.setState({ isDialogVisible: false });
  };

  status_changed = async (option) => {
    this.setState({ isLoading: true, confiramtion_modal: false });
    await axios({
      method: "post",
      url: api_url + status_change,
      data: {
        trip_id: this.state.trip_id,
        option: option,
      },
    })
      .then(async (response) => {
        this.setState({ isLoading: false });
        this.get_trip_details();
      })
      .catch((error) => {
        alert(strings.sorry_something_went_wrong);
        this.setState({ isLoading: false });
      });
  };

  status_change = async () => {
    console.log({
      trip_id: this.state.trip_id,
      status: this.state.data.new_status,
      address: this.state.address,
      lat: this.state.lat,
      lng: this.state.lng,
    });
    await this.onRegionChange();
    this.setState({ isLoading: true });
    await axios({
      method: "post",
      url: api_url + status_change,
      data: {
        trip_id: this.state.trip_id,
        status: this.state.data.new_status,
        address: this.state.address,
        lat: this.state.lat,
        lng: this.state.lng,
      },
    })
      .then(async (response) => {
        this.setState({ isLoading: false });
        this.get_trip_details();
      })
      .catch((error) => {
        alert(strings.sorry_something_went_wrong);
        this.setState({ isLoading: false });
      });
  };

  get_stops = async () => {
    this.setState({ isLoading: true });
    await axios({
      method: "post",
      url: api_url + get_stops,
      data: { trip_id: this.state.trip_id },
    })
      .then(async (response) => {
        this.setState({ isLoading: false, stops: response.data.result });
      })
      .catch((error) => {
        alert(strings.sorry_something_went_wrong);
        this.setState({ isLoading: false });
      });
  };

  sendInput(val) {
    if (val == this.state.data.otp) {
      this.setState({ isDialogVisible: false });
      this.status_change();
    } else {
      this.setState({ isDialogVisible: false });
      alert(strings.please_enter_valid_otp);
    }
  }

  onRegionChange = async () => {
    fetch(
      "https://maps.googleapis.com/maps/api/geocode/json?address=" +
        this.state.lat +
        "," +
        this.state.lng +
        "&key=" +
        GOOGLE_KEY
    )
      .then((response) => response.json())
      .then(async (responseJson) => {
        if (responseJson.results[0].formatted_address) {
          this.setState({ address: responseJson.results[0].formatted_address });
        }
      });
  };

  redirection = () => {
    if (this.state.pickup_statuses.includes(this.state.data.status)) {
      var lat = this.state.data.pickup_lat;
      var lng = this.state.data.pickup_lng;
    } else {
      var lat = this.state.data.drop_lat;
      var lng = this.state.data.drop_lng;
    }

    if (lat != 0 && lng != 0) {
      var scheme = Platform.OS === "ios" ? "maps:" : "geo:";
      var url = scheme + `${lat},${lng}`;
      if (Platform.OS === "android") {
        Linking.openURL("google.navigation:q=" + lat + " , " + lng + "&mode=d");
      } else {
        Linking.openURL(
          "https://www.google.com/maps/dir/?api=1&destination=" +
            lat +
            "," +
            lng +
            "&travelmode=driving"
        );
      }
    }
  };

  stop_redirection = (lat, lng) => {
    if (lat != 0 && lng != 0) {
      var scheme = Platform.OS === "ios" ? "maps:" : "geo:";
      var url = scheme + `${lat},${lng}`;
      if (Platform.OS === "android") {
        Linking.openURL("google.navigation:q=" + lat + " , " + lng + "&mode=d");
      } else {
        Linking.openURL(
          "https://www.google.com/maps/dir/?api=1&destination=" +
            lat +
            "," +
            lng +
            "&travelmode=driving"
        );
      }
    }
  };

  chat = async () => {
    this.setState({ _isMounted: false });
    await this.props.navigation.navigate("Chat", {
      trip_id: this.state.trip_id,
      customer_name: this.state.data.customer_name,
    });
  };

  call_support(phone) {
    Linking.openURL(`tel:${phone}`);
  }

  call_customer(phone_number) {
    Linking.openURL(`tel:${phone_number}`);
  }

  open_dialog = () => {
    this.setState({ Dialog_popup: true });
  };

  trip_cancel = async (reason_id) => {
    this.setState({ Dialog_popup: false, isLoading: true });
    await axios({
      method: "post",
      url: api_url + trip_cancel,
      data: {
        reason_id: reason_id,
        trip_id: this.state.trip_id,
        status: 7,
        cancelled_by: 2,
      },
    })
      .then(async (response) => {
        this.setState({ isLoading: false });
        if (response.data.status == 1) {
          this.home();
        }
      })
      .catch((error) => {
        this.setState({ isLoading: false });
        alert("Sorry Something went wrong");
      });
  };

  cancel_ride = async () => {
    await axios({
      method: "post",
      url: api_url + cancel_ride,
      data: { lang: global.lang, type: 2 },
    })
      .then(async (response) => {
        this.setState({ cancel_reason: response.data.result });
      })
      .catch((error) => {
        alert(strings.sorry_something_went_wrong);
      });
  };

  render() {
    return (
      <SafeAreaView style={{ height: "100%", width: "100%" }}>
        <Loader visible={this.state.isLoading} />
        {this.state.data && (
          <ScrollView scrollEnabled={false}>
            {this.state.data.status < 4 && (
              <View>
                {this.state.drop_statuses.includes(this.state.data.status) && (
                  <View>
                    {this.state.stops.map((row, index) => (
                      <View
                        style={{
                          backgroundColor: colors.theme_bg_three,
                          padding: 20,
                          flexDirection: "row",
                          width: "94%",
                          marginLeft: "2%",
                          marginRight: "2%",
                          borderRadius: 10,
                        }}
                      >
                        <View
                          style={{
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FontAwesome
                            name="location-arrow"
                            size={35}
                            style={styles.icon}
                            onPress={() =>
                              this.stop_redirection(row.lat, row.lng)
                            }
                          />
                        </View>
                        <View
                          style={{
                            borderRightWidth: 1,
                            borderColor: colors.theme_fg_two,
                            marginLeft: 15,
                          }}
                        />
                        <View style={{ margin: 10 }} />
                        <View
                          style={{
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {this.state.drop_statuses.includes(
                            this.state.data.status
                          ) &&
                            this.state.data.drop_lat != 0 &&
                            this.state.data.drop_lng != 0 && (
                              <Text
                                style={{
                                  alignSelf: "center",
                                  fontFamily: font_description,
                                  color: colors.theme_fg_two,
                                  marginRight: "10%",
                                  fontSize: 14,
                                }}
                              >
                                {row.address}
                              </Text>
                            )}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
                <View
                  style={{
                    backgroundColor: colors.theme_bg_three,
                    padding: 20,
                    flexDirection: "row",
                    width: "94%",
                    marginLeft: "2%",
                    marginRight: "2%",
                    borderRadius: 10,
                  }}
                >
                  <View
                    style={{ alignItems: "center", justifyContent: "center" }}
                  >
                    <FontAwesome
                      name="location-arrow"
                      size={35}
                      style={styles.icon}
                      onPress={this.redirection}
                    />
                  </View>
                  <View
                    style={{
                      borderRightWidth: 1,
                      borderColor: colors.theme_fg_two,
                      marginLeft: 15,
                    }}
                  />
                  <View style={{ margin: 10 }} />
                  <View
                    style={{ alignItems: "center", justifyContent: "center" }}
                  >
                    {this.state.pickup_statuses.includes(
                      this.state.data.status
                    ) && (
                      <Text
                        style={{
                          alignSelf: "center",
                          fontFamily: font_description,
                          color: colors.theme_fg_two,
                          marginRight: "10%",
                          fontSize: 14,
                        }}
                      >
                        {this.state.data.pickup_address}
                      </Text>
                    )}
                    {this.state.drop_statuses.includes(
                      this.state.data.status
                    ) &&
                      this.state.data.drop_lat != 0 &&
                      this.state.data.drop_lng != 0 && (
                        <Text
                          style={{
                            alignSelf: "center",
                            fontFamily: font_description,
                            color: colors.theme_fg_two,
                            marginRight: "10%",
                            fontSize: 14,
                          }}
                        >
                          {this.state.data.drop_address}
                        </Text>
                      )}
                    {this.state.drop_statuses.includes(
                      this.state.data.status
                    ) &&
                      this.state.data.drop_lat == 0 &&
                      this.state.data.drop_lng == 0 && (
                        <Text
                          style={{
                            alignSelf: "center",
                            fontFamily: font_description,
                            color: colors.theme_fg_two,
                            marginRight: "10%",
                            fontSize: 14,
                          }}
                        >
                          This is rental booking so drop location is not updated
                        </Text>
                      )}
                  </View>
                </View>
              </View>
            )}
            {console.log(
              "this.state.data",
              global.polyline_status,
              this.state.data
            )}
            {this.state.data.status < 4 && (
              <View style={styles.map_container}>
                <MapView
                  provider={PROVIDER_GOOGLE}
                  showsUserLocation={true}
                  style={styles.map}
                  showsMyLocationButton={true}
                  region={this.state.mapRegion}
                >
                  {this.state.data.status <= 2 && (
                    <MapView.Marker
                      coordinate={this.createMarker(
                        parseFloat(this.state.data.pickup_lat),
                        parseFloat(this.state.data.pickup_lng)
                      )}
                    >
                      <Image
                        style={{ flex: 1, height: 30, width: 25 }}
                        source={require(".././assets/img/from_location_pin.png")}
                      />
                    </MapView.Marker>
                  )}
                  {this.state.data.status >= 2 && (
                    <MapView.Marker
                      coordinate={this.createMarker(
                        parseFloat(this.state.data.drop_lat),
                        parseFloat(this.state.data.drop_lng)
                      )}
                    >
                      <Image
                        style={{ flex: 1, height: 30, width: 25 }}
                        source={require(".././assets/img/to_location_pin.png")}
                      />
                    </MapView.Marker>
                  )}
                  {global.polyline_status == 1 && (
                    <PolylineDirection
                      origin={
                        this.state.data.status <= 2
                          ? this.createMarker(
                              parseFloat(this.state.data.pickup_lat),
                              parseFloat(this.state.data.pickup_lng)
                            )
                          : this.createMarker(
                              parseFloat(this.state.data.drop_lat),
                              parseFloat(this.state.data.drop_lng)
                            )
                      }
                      destination={this.state.live_location}
                      apiKey={GOOGLE_KEY}
                      strokeWidth={4}
                      strokeColor={colors.theme_fg}
                    />
                  )}
                </MapView>
              </View>
            )}

            {this.state.data.status == 4 && (
              <View style={{ margin: 20 }}>
                <View
                  style={{ alignItems: "center", justifyContent: "center" }}
                >
                  <Text style={styles.price}>
                    {global.currency}
                    {this.state.data.collection_amount}
                  </Text>

                  {global.lang == "en" ? (
                    <Text style={styles.payment_mode}>
                      {this.state.data.payment_method}
                    </Text>
                  ) : (
                    <Text style={styles.payment_mode}>
                      {this.state.data.payment_method_ar}
                    </Text>
                  )}
                  <View style={{ margin: 10 }} />
                  <Text style={styles.date_time}>
                    Traveling Kms : {this.state.data?.distance} Kms
                  </Text>
                  <Text style={styles.date_time}>
                    Total timing : {this.state.data?.total_timeing}
                  </Text>

                  {this.state.data?.discount != 0 && (
                    <Text style={styles.date_time}>
                      Discount : {this.state.data?.discount} {global.currency}
                    </Text>
                  )}
                  <Text style={styles.date_time}>
                    {Moment(this.state.data.pickup_date).format(
                      "MMM DD, YYYY hh:mm A"
                    )}
                  </Text>
                </View>
                <Divider style={styles.default_divider} />
                <View style={{ flexDirection: "row" }}>
                  <View
                    style={{
                      justifyContent: "center",
                      flexDirection: "column",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        width: "90%",
                        marginLeft: "5%",
                      }}
                    >
                      <Badge status="success" />
                      <View style={{ marginLeft: 10 }} />
                      <Text style={styles.address}>
                        {this.state.data.actual_pickup_address}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={{ margin: 10 }} />
                <View style={{ flexDirection: "row" }}>
                  <View
                    style={{
                      justifyContent: "center",
                      flexDirection: "column",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        width: "90%",
                        marginLeft: "5%",
                      }}
                    >
                      <Badge status="error" />
                      <View style={{ marginLeft: 10 }} />
                      <Text style={styles.address}>
                        {this.state.data.actual_drop_address}
                      </Text>
                    </View>
                  </View>
                </View>
                <Divider style={styles.default_divider} />
                <View style={{ flexDirection: "row", width: "100%" }}>
                  <View
                    style={{
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      source={{
                        uri: img_url + this.state.data.customer_profile_picture,
                      }}
                      style={{ height: 80, width: 80, borderRadius: 40 }}
                    />
                  </View>
                </View>
                <View style={{ margin: 5 }} />
                <View style={{ flexDirection: "row", width: "100%" }}>
                  <View
                    style={{
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={styles.driver_name}>
                      {this.state.data.customer_name}
                    </Text>
                  </View>
                </View>
                <View style={{ margin: 10 }} />
              </View>
            )}
            <DialogInput
              isDialogVisible={this.state.isDialogVisible}
              title={strings.verification}
              message={strings.enter_otp}
              hintInput={strings.otp}
              textInputProps={{ keyboardType: "phone-pad" }}
              submitInput={(inputText) => {
                this.sendInput(inputText);
              }}
              closeDialog={() => {
                this.showDialog(false);
              }}
              submitText={strings.submit}
              cancelText={strings.cancel}
            ></DialogInput>
            {this.state.data.status == 4 && (
              <Dialog
                visible={this.state?.confiramtion_modal}
                width="90%"
                animationDuration={100}
                dialogTitle={<DialogTitle title="Cash received?" />}
                dialogAnimation={
                  new SlideAnimation({
                    slideFrom: "bottom",
                  })
                }
                footer={
                  <DialogFooter>
                    <DialogButton
                      text="Yes"
                      textStyle={{ fontSize: 16, color: colors.theme_fg_two }}
                      onPress={() => {
                        this.setState({ confiramtion_modal: false });
                        this.status_changed("yes");
                      }}
                    />
                    <DialogButton
                      text="No"
                      textStyle={{ fontSize: 16, color: colors.theme_fg_two }}
                      onPress={() => {
                        this.setState({ confiramtion_modal: false });
                        this.status_changed("no");
                      }}
                    />
                  </DialogFooter>
                }
                onTouchOutside={() => {
                  this.setState({ Dialog_popup: false });
                }}
              ></Dialog>
            )}
            {
              <View style={{ position: "absolute", right: 30, bottom: 220 }}>
                <Image
                  source={{ uri: support_icon }}
                  style={styles.chat_icon}
                  onPress={() => this.call_support(this.state.support_contact)}
                />
              </View>
            }
            {this.state.data.status <= 2 && (
              <View style={{ position: "absolute", right: 30, bottom: 220 }}>
                <FontAwesome
                  name="phone"
                  size={55}
                  style={styles.chat_icon}
                  onPress={() =>
                    this.call_customer(this.state.data.customer_phone_number)
                  }
                />
              </View>
            )}
            {this.state.data.status <= 2 && (
              <View style={{ position: "absolute", right: 30, bottom: 170 }}>
                <FontAwesome
                  name="comments"
                  size={55}
                  style={styles.chat_icon}
                  onPress={this.chat}
                />
              </View>
            )}
            {this.state.data.status <= 2 && (
              <View style={{ position: "absolute", right: 30, bottom: 120 }}>
                <FontAwesome
                  name="window-close"
                  size={55}
                  style={styles.chat_icon}
                  onPress={this.open_dialog}
                />
              </View>
            )}
          </ScrollView>
        )}
        <View
          style={{
            backgroundColor: colors.theme_bg_three,
            padding: 10,

            width: "94%",
            marginLeft: "2%",
            marginRight: "2%",
            borderRadius: 10,
            paddingBottom: 60,
          }}
        >
          <Text
            style={{
              textAlign: "center",
              alignSelf: "center",
              fontFamily: font_description,
              color: colors.theme_fg_two,

              fontSize: 14,
            }}
          >
            Customer Details
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 4,
            }}
          >
            <Text
              style={{
                fontFamily: font_description,
                color: colors.theme_fg_two,

                fontSize: 14,
              }}
            >
              Name: {this.state.data?.customer_name}
            </Text>
            <Text
              style={{
                fontFamily: font_description,
                color: colors.theme_fg_two,

                fontSize: 14,
              }}
            >
              Phone: {this.state.data?.customer_phone_number}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: font_description,
              color: colors.theme_fg_two,
              marginTop: 3,
              fontSize: 14,
            }}
          >
            Rateings:
            <StarRating
              disabled={true}
              maxStars={5}
              starSize={10}
              rating={this.state.data?.customer_rating}
              starStyle={{
                paddingRight: 5,
                color: colors.star_rating,
                paddingTop: 2,
              }}
            />
          </Text>
        </View>
        {this.state.data && this.state.data.status < 5 && (
          <TouchableOpacity
            activeOpacity={1}
            onPress={this.check_otp.bind(this)}
            style={styles.footer}
          >
            {global.lang == "en" ? (
              <Text
                style={{
                  fontSize: 20,
                  color: colors.theme_fg_three,
                  fontFamily: font_title,
                }}
              >
                {this.state.data.new_driver_status_name}
              </Text>
            ) : (
              <Text
                style={{
                  fontSize: 20,
                  color: colors.theme_fg_three,
                  fontFamily: font_title,
                }}
              >
                {this.state.data.new_driver_status_name_ar}
              </Text>
            )}
          </TouchableOpacity>
        )}
        <Dialog
          visible={this.state.Dialog_popup}
          width="90%"
          animationDuration={100}
          dialogTitle={<DialogTitle title="Please select reason" />}
          dialogAnimation={
            new SlideAnimation({
              slideFrom: "bottom",
            })
          }
          footer={
            <DialogFooter>
              <DialogButton
                text="Close"
                textStyle={{ fontSize: 16, color: colors.theme_fg_two }}
                onPress={() => {
                  this.setState({ Dialog_popup: false });
                }}
              />
            </DialogFooter>
          }
          onTouchOutside={() => {
            this.setState({ Dialog_popup: false });
          }}
        >
          <DialogContent>
            <FlatList
              data={this.state.cancel_reason}
              renderItem={({ item, index }) => (
                <View>
                  <TouchableOpacity
                    onPress={this.trip_cancel.bind(this, item.id)}
                  >
                    <View
                      style={{
                        paddingTop: 20,
                        paddingBottom: 20,
                        borderBottomWidth: 0.5,
                        borderColor: colors.theme_fg_four,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: font_description,
                          fontSize: 14,
                          color: colors.theme_fg_four,
                        }}
                      >
                        {item.reason}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
              keyExtractor={(item) => item.id}
            />
          </DialogContent>
        </Dialog>
        <DropdownAlert
          ref={(ref) => (this.dropDownAlertRef = ref)}
          closeInterval={alert_close_timing}
        />
      </SafeAreaView>
    );
  }
}

export default Trip;
const styles = StyleSheet.create({
  icon: {
    color: colors.theme_fg_two,
  },
  chat_icon: {
    color: colors.theme_fg,
    fontSize: 35,
  },
  default_divider: {
    marginTop: 20,
    marginBottom: 20,
  },
  footer: {
    backgroundColor: colors.theme_bg,
    height: 50,
    padding: 10,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 0,
  },
  map_container: {
    height: Dimensions.get("window").height - 130,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },

  price: {
    alignSelf: "center",
    color: colors.theme_fg_two,
    alignSelf: "center",
    fontSize: 40,
    fontFamily: font_description,
  },
  payment_mode: {
    alignSelf: "center",
    color: colors.theme_fg_two,
    alignSelf: "center",
    fontSize: 20,
    fontFamily: font_description,
  },
  date_time: {
    color: colors.theme_fg_two,
    fontSize: 12,
    fontFamily: font_description,
  },
  address: {
    fontSize: 14,
    color: colors.theme_fg_two,
    fontFamily: font_description,
  },
  driver_name: {
    color: colors.theme_fg_two,
    fontSize: 18,
    letterSpacing: 1,
    fontFamily: font_description,
  },
});
