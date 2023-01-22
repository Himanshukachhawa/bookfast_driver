import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  PermissionsAndroid,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import * as colors from "../assets/css/Colors";
import {
  font_title,
  font_description,
  api_url,
  GOOGLE_KEY,
  get_fare,
  direct_booking,
  spot_otp,
} from "../config/Constants";
import Loader from "../components/Loader";
import axios from "axios";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import FusedLocation from "react-native-fused-location";
import DialogInput from "react-native-dialog-input";
import strings from "../languages/strings.js";
import RNLocation from "react-native-location";

export default class DirectBooking extends Component<Props> {
  constructor(props) {
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      pickup_address: "",
      pickup_lat: "",
      pickup_lng: "",
      drop_address: "",
      drop_lat: "",
      drop_lng: "",
      customer_name: "",
      otp: "",
      phone_number: "",
      visible: false,
      fare: 0,
      km: 0,
      isLoading: false,
      isDialogVisible: false,
    };
  }

  handleBackButtonClick = () => {
    this.props.navigation.goBack(null);
  };

  async componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener("focus", async () => {
      if (Platform.OS == "android") {
        await this.get_android_location();
      } else {
        await this.get_ios_location();
      }
    });
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  show_alert(message) {
    this.dropDownAlertRef.alertWithType("error", strings.error, message);
  }

  get_android_location = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: strings.app_needs_to_access_your_location,
        message:
          strings.app_needs_to_access_your_location +
          strings.so_we_can_let_our_app_be_even_more_awesome,
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
      this.subscription = FusedLocation.on("fusedLocation", (location) => {
        if (!this.state.pickup_address) {
          this.get_place_id(location.latitude, location.longitude);
        }
      });
    }
  };

  get_ios_location = async () => {
    RNLocation.requestPermission({
      ios: "whenInUse",
      android: {
        detail: "coarse",
      },
    }).then((granted) => {
      if (granted) {
        this.locationSubscription = RNLocation.subscribeToLocationUpdates(
          (locations) => {
            if (!this.state.pickup_address) {
              this.get_place_id(locations[0].latitude, locations[0].longitude);
            }
          }
        );
      }
    });
  };

  getPickupLocations = async (data, details) => {
    await this.get_lat_lng(details.place_id, "pickup");
    await this.get_distance();
  };

  getDropLocations = async (data, details) => {
    await this.get_lat_lng(details.place_id, "drop");
    await this.get_distance();
  };

  get_place_id = async (lat, lng) => {
    this.setState({ isLoading: true });
    await axios({
      method: "get",
      url:
        "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
        lat +
        "," +
        lng +
        "&key=" +
        GOOGLE_KEY,
    })
      .then(async (response) => {
        this.setState({ isLoading: false });
        if (response.data.results[0].place_id) {
          if (!this.state.pickup_address) {
            this.get_lat_lng(response.data.results[0].place_id, "pickup");
          }
        } else {
          alert(strings.sorry_something_went_wrong);
        }
      })
      .catch((error) => {
        this.setState({ isLoading: false });
      });
  };

  get_lat_lng = async (place_id, slug) => {
    this.setState({ isLoading: true });
    await axios({
      method: "get",
      url:
        "https://maps.googleapis.com/maps/api/place/details/json?placeid=" +
        place_id +
        "&key=" +
        GOOGLE_KEY,
    })
      .then(async (response) => {
        this.setState({ isLoading: false });
        if (slug == "pickup") {
          this.setState({
            pickup_address: response.data.result.formatted_address,
            pickup_lat: response.data.result.geometry.location.lat,
            pickup_lng: response.data.result.geometry.location.lng,
          });
        } else if (slug == "drop") {
          this.setState({
            drop_address: response.data.result.formatted_address,
            drop_lat: response.data.result.geometry.location.lat,
            drop_lng: response.data.result.geometry.location.lng,
          });
        }
      })
      .catch((error) => {
        this.setState({ isLoading: false });
      });
  };

  get_fare = async () => {
    this.setState({ isLoading: true });
    await axios({
      method: "post",
      url: api_url + get_fare,
      data: {
        trip_type: 1,
        country_id: global.country_id,
        km: this.state.km.slice(0, this.state.km.length - 2),
        promo: 0,
        vehicle_type: global.vehicle_type,
      },
    })
      .then(async (response) => {
        this.setState({ isLoading: false });
        if (response.data.status == 1) {
          this.setState({ fare: response.data.result.total_fare });
        }
      })
      .catch((error) => {
        this.setState({ isLoading: false });
        alert(strings.sorry_something_went_wrong);
      });
  };

  get_distance = async () => {
    if (this.state.pickup_address && this.state.drop_address) {
      this.setState({ isLoading: true });
      await axios({
        method: "get",
        url:
          "https://maps.googleapis.com/maps/api/directions/json?origin=" +
          this.state.pickup_lat +
          "," +
          this.state.pickup_lng +
          "&destination=" +
          this.state.drop_lat +
          "," +
          this.state.drop_lng +
          "&key=" +
          GOOGLE_KEY,
      })
        .then(async (response) => {
          this.setState({ isLoading: false });
          if (response.data.routes) {
            this.setState({
              km: response.data.routes[0].legs[0].distance.text,
            });
            await this.get_fare();
          }
        })
        .catch((error) => {
          this.setState({ isLoading: false });
          alert(strings.sorry_something_went_wrong);
        });
    }
  };

  check_validate = async () => {
    if (
      this.state.pickup_address == "" ||
      this.state.pickup_lat == "" ||
      this.state.pickup_lng == ""
    ) {
      this.setState({ validation: false });
      alert(strings.please_select_pickup_location);
    } else if (
      this.state.drop_address == "" ||
      this.state.drop_lat == "" ||
      this.state.drop_lng == ""
    ) {
      this.setState({ validation: false });
      alert(strings.please_select_drop_location);
    } else if (
      this.state.customer_name == "" ||
      this.state.phone_number == ""
    ) {
      this.setState({ validation: false });
      alert(strings.please_enter_customer_details);
    } else {
      this.setState({ visible: true });
      this.spot_otp();
    }
  };

  check_otp = async (code) => {
    if (code != this.state.otp) {
      alert(strings.please_enter_valid_otp);
    } else {
      this.setState({ visible: false });
      this.props.navigation.navigate("Bookings");
    }
  };

  book_now = async () => {
    console.log({
      phone_number: this.state.phone_number,
      customer_name: this.state.customer_name,
      pickup_address: this.state.pickup_address,
      pickup_lat: this.state.pickup_lat,
      pickup_lng: this.state.pickup_lng,
      drop_address: this.state.drop_address,
      drop_lat: this.state.drop_lat,
      drop_lng: this.state.drop_lng,
      driver_id: parseInt(global.id),
      km: parseFloat(this.state.km),
      vehicle_type: global.vehicle_type,
      promo: 0,
      country_id: parseInt(global.country_id),
    });
    this.setState({ isLoading: true });
    await axios({
      method: "post",
      url: api_url + direct_booking,
      data: {
        phone_number: this.state.phone_number,
        customer_name: this.state.customer_name,
        pickup_address: this.state.pickup_address,
        pickup_lat: this.state.pickup_lat,
        pickup_lng: this.state.pickup_lng,
        drop_address: this.state.drop_address,
        drop_lat: this.state.drop_lat,
        drop_lng: this.state.drop_lng,
        driver_id: parseInt(global.id),
        km: parseFloat(this.state.km),
        vehicle_type: global.vehicle_type,
        promo: 0,
        country_id: parseInt(global.country_id),
      },
    })
      .then(async (response) => {
        this.setState({ isLoading: false });
      })
      .catch((error) => {
        console.log(error);
        this.setState({ isLoading: false });
      });
  };

  spot_otp = async () => {
    this.setState({ isLoading: true });
    await axios({
      method: "post",
      url: api_url + spot_otp,
      data: {
        phone_number: this.state.phone_number,
        phone_with_code: global.phone_with_code,
        customer_name: this.state.customer_name,
        pickup_address: this.state.pickup_address,
        pickup_lat: this.state.pickup_lat,
        pickup_lng: this.state.pickup_lng,
        drop_address: this.state.drop_address,
        drop_lat: this.state.drop_lat,
        drop_lng: this.state.drop_lng,
        driver_id: parseInt(global.id),
        km: parseFloat(this.state.km),
        vehicle_type: global.vehicle_type,
        promo: 0,
        fare: this.state.fare,
        country_id: parseInt(global.country_id),
      },
    })
      .then(async (response) => {
        console.log(response.data.result.otp);
        this.setState({
          isLoading: false,
          otp: response.data.result.otp,
          isDialogVisible: true,
        });
      })
      .catch((error) => {
        this.setState({ isLoading: false });
      });
  };

  sendInput(val) {
    if (val == this.state.otp) {
      this.setState({ isDialogVisible: false });
      this.book_now();
    } else {
      this.setState({ isDialogVisible: false });
      alert(strings.please_enter_valid_otp);
    }
  }

  showDialog = (val) => {
    this.setState({ isDialogVisible: false });
  };

  render() {
    return (
      <SafeAreaView style={{ backgroundColor: colors.theme_bg_three, flex: 1 }}>
        <Loader visible={this.state.isLoading} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={{ margin: 10 }} />
          <View style={{ width: "90%", marginLeft: "5%" }}>
            <Text
              style={{
                color: colors.theme_fg_two,
                fontSize: 18,
                fontFamily: font_title,
              }}
            >
              {strings.pickup_location}
            </Text>
            <View style={{ margin: 5 }} />
            <Text
              style={{
                color: colors.theme_fg_two,
                fontSize: 15,
                fontFamily: font_description,
              }}
            >
              {this.state.pickup_address}
            </Text>
          </View>
          <View style={{ margin: 10 }} />
          <View style={{ width: "90%", marginLeft: "5%" }}>
            <Text
              style={{
                color: colors.theme_fg_two,
                fontSize: 18,
                fontFamily: font_title,
              }}
            >
              {strings.drop_location}
            </Text>
            <View style={{ margin: 5 }} />
            <GooglePlacesAutocomplete
              placeholder={strings.search}
              currentLocation={true}
              enableHighAccuracyLocation={true}
              onPress={(data, details = null) => {
                this.getDropLocations(data, details);
              }}
              styles={{
                textInputContainer: {
                  borderRadius: 5,
                  fontFamily: font_description,
                  colors: colors.theme_fg_two,
                  fontSize: 14,
                  borderColor: colors.theme_bg_two,
                  borderWidth: 1,
                },
              }}
              GooglePlacesDetailsQuery={{ fields: "name" }}
              query={{
                key: GOOGLE_KEY,
                language: "en",
                location: this.state.pickup_lat + "," + this.state.pickup_lng,
                radius: "1500",
                types: ["geocode", "address"],
              }}
            />
          </View>
          <View style={{ margin: 10 }} />
          <View style={{ width: "90%", marginLeft: "5%" }}>
            <Text
              style={{
                color: colors.theme_fg_two,
                fontSize: 18,
                fontFamily: font_title,
              }}
            >
              {strings.customer_details}
            </Text>
            <View style={{ margin: 10 }} />
            <TextInput
              placeholder={strings.customer_name}
              placeholderTextColor={colors.theme_fg_four}
              style={styles.textinput}
              value={this.state.customer_name}
              onChangeText={(TextInputValue) =>
                this.setState({ customer_name: TextInputValue })
              }
            />
            <View style={{ margin: 15 }} />
            <TextInput
              placeholder={strings.phone_number}
              keyboardType="number-pad"
              placeholderTextColor={colors.theme_fg_four}
              style={styles.textinput}
              value={this.state.phone_number}
              onChangeText={(TextInputValue) =>
                this.setState({ phone_number: TextInputValue })
              }
            />
          </View>
          <View style={{ margin: 10 }} />
          <View
            style={{ width: "90%", marginLeft: "5%", alignItems: "center" }}
          >
            <Text
              style={{
                color: colors.theme_fg_two,
                fontSize: 18,
                fontFamily: font_description,
              }}
            >
              {strings.trip_fare}
            </Text>
            <Text
              style={{
                color: colors.theme_fg_two,
                fontSize: 25,
                fontFamily: font_title,
              }}
            >
              {global.currency}
              {this.state.fare}
            </Text>
          </View>
          <View style={{ margin: 10 }} />
          <View style={styles.container}>
            <DialogInput
              isDialogVisible={this.state.isDialogVisible}
              title={strings.verification}
              message={strings.enter_OTP}
              hintInput={strings.OTP}
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
          </View>
          <View style={{ margin: 20 }} />
          <TouchableOpacity
            activeOpacity={1}
            onPress={this.check_validate}
            style={styles.footer}
          >
            <Text
              style={{
                fontSize: 18,
                color: colors.theme_fg_three,
                fontFamily: font_title,
              }}
            >
              {strings.send_otp}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.theme_bg,
    height: 60,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    color: colors.theme_fg_three,
  },
  flex_1: {
    width: "33%",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: 10,
  },
  header_body: {
    justifyContent: "center",
    alignItems: "flex-start",
    width: "67%",
  },
  title: {
    color: colors.theme_fg_three,
    fontSize: 20,
    fontFamily: font_title,
  },
  description: {
    color: colors.theme_fg_four,
    fontFamily: font_description,
  },
  textinput: {
    borderBottomWidth: 1,
    fontSize: 14,
    color: colors.theme_bg_two,
    fontFamily: font_description,
    borderBottomColor: colors.theme_fg_four,
    borderBottomWidth: 1,
  },
  footer_content: {
    width: "90%",
    marginLeft: "5%",
  },
  footer: {
    width: "90%",
    marginLeft: "5%",
    marginRight: "5%",
    backgroundColor: colors.theme_bg,
    padding: 10,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
});
