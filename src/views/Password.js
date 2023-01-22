import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  Image,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import * as colors from "../assets/css/Colors";
import {
  alert_close_timing,
  font_title,
  font_description,
  api_url,
  login,
  height_40,
  go_icon,
  check_phone,
} from "../config/Constants";
import Loader from "../components/Loader";
import DropdownAlert from "react-native-dropdownalert";
import {
  loginPending,
  loginError,
  loginSuccess,
} from "../actions/LoginActions";
import { connect } from "react-redux";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import strings from "../languages/strings.js";

class Password extends Component<Props> {
  constructor(props) {
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      phone_number: this.props.route.params.phone_number,
      password: "",
      validation: false,
      isLoading: false,
      timer: 30,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.password.focus();
    }, 200);
    if (global.mode == "DEMO") {
      setTimeout(() => {
        this.login();
      }, 1000);
    } else {
      this.start_timer();
    }
  }
  start_timer() {
    this.clockCall = setInterval(() => {
      this.decrementClock();
    }, 1000);
  }
  decrementClock = () => {
    if (this.state.timer < 1) {
      clearInterval(this.clockCall);
    } else {
      this.setState((prevstate) => ({ timer: prevstate.timer - 1 }));
    }
  };

  call_resend(phone_with_code) {
    this.check_phone_register(phone_with_code);
  }

  componentWillUnmount() {
    clearInterval(this.clockCall);
  }
  handleBackButtonClick = () => {
    this.props.navigation.goBack(null);
  };
  async check_phone_register(phone_with_code) {
    console.log("phone_with_code", phone_with_code);
    this.setState({ isLoading: true });
    await axios({
      method: "post",
      url: api_url + check_phone,
      data: { phone_with_code: phone_with_code.slice(3) },
    })
      .then(async (response) => {
        console.log("eee", response);
        this.setState({ isLoading: false });
        if (response.data.status == 1) {
          this.setState({ otp: response.data.result.otp, timer: 30 });
          this.start_timer();
        }
      })
      .catch((error) => {
        console.log(error);
        this.setState({ isLoading: false });
        alert(strings.sorry_something_went_wrong);
      });
  }
  async forgot() {
    this.props.navigation.navigate("Forgot");
  }

  async login() {
    await this.check_validate();
    if (this.state.validation) {
      this.setState({ isLoading: true });
      console.log(
        "this.state.phone_number",
        this.state.phone_number.substring(3)
      );
      this.props.loginPending();
      await axios({
        method: "post",
        url: api_url + login,
        data: {
          phone_with_code: this.state.phone_number.substring(3),
          password: this.state.password,
          fcm_token: global.fcm_token,
        },
      })
        .then(async (response) => {
          console.log("rees", response?.data?.status);
          this.setState({ isLoading: false });
          await this.props.loginSuccess(response.data);
          if (response.data.status == 1) {
            await this.saveData();
          } else if (response.data.status == 2) {
            global.id = response.data.result.id;
            global.country_id = response.data.result.country_id;
            await this.vehicle_details();
          } else if (response.data.status == 3) {
            global.id = response.data.result.id;
            global.country_id = response.data.result.country_id;
            await this.vehicle_documents();
          } else {
            alert(response.data.message);
          }
        })
        .catch((error) => {
          console.log("ss", error);
          this.setState({ isLoading: false });
          alert(strings.sorry_something_went_wrong);
          this.props.loginError(error);
        });
    }
  }

  saveData = async () => {
    console.log("sssss", this.props?.data);
    if (this.props.status == 1) {
      try {
        await AsyncStorage.setItem("id", this.props.data.id.toString());
        await AsyncStorage.setItem(
          "first_name",
          this.props.data.first_name.toString()
        );
        await AsyncStorage.setItem(
          "phone_with_code",
          this.props.data.phone_with_code.toString()
        );
        await AsyncStorage.setItem("email", this.props.data.email.toString());
        await AsyncStorage.setItem(
          "country_id",
          this.props.data.country_id.toString()
        );
        await AsyncStorage.setItem(
          "currency",
          this.props.data.currency.toString()
        );
        await AsyncStorage.setItem(
          "profile_picture",
          this.props.data.profile_picture.toString()
        );
        await AsyncStorage.setItem("wallet", this.props.data.wallet.toString());
        await AsyncStorage.setItem("zone", this.props.data.zone.toString());
        await AsyncStorage.setItem(
          "vehicle_type",
          this.props?.data?.vehicle_type?.toString()
        );
        await AsyncStorage.setItem(
          "vehicle_id",
          this.props.data.vehicle_id.toString()
        );
        global.id = await this.props.data.id;
        global.first_name = await this.props.data.first_name;
        global.phone_with_code = await this.props.data.phone_with_code;
        global.email = await this.props.data.email;
        global.country_id = await this.props.data.country_id;
        global.currency = await this.props.data.currency;
        global.wallet = await this.props.data.wallet;
        global.zone = await this.props.data.zone;
        global.vehicle_type = await this.props.data.vehicle_type;
        global.vehicle_id = await this.props.data.vehicle_id;
        global.profile_picture = await this.props.data.profile_picture;
        await this.home();
      } catch (e) {
        console.log("e", e);
      }
    } else {
      this.dropDownAlertRef.alertWithType("error", "Error", this.props.message);
    }
  };

  async check_validate() {
    if (this.state.password == "") {
      this.setState({ validation: false });
      this.show_alert(strings.please_enter_password);
    } else {
      this.setState({ validation: true });
    }
  }

  home = () => {
    console.log("ssss hhh");
    this.props.navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    );
  };

  vehicle_details = (id) => {
    this.props.navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "VehicleDetails" }],
      })
    );
  };

  vehicle_documents = () => {
    this.props.navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Document" }],
      })
    );
  };

  show_alert(message) {
    this.dropDownAlertRef.alertWithType("error", strings.error, message);
  }

  render() {
    const { isLoding, error, data, message, status } = this.props;
    return (
      <View
        style={{
          backgroundColor: colors.theme_fg_three,
          height: "100%",
          width: "100%",
        }}
      >
        <Loader visible={this.state.isLoading} />
        <View>
          <View style={{ padding: 20, height: height_40 }}>
            <TextInput
              ref={(ref) => (this.password = ref)}
              keyboardType={"number-pad"}
              secureTextEntry={true}
              placeholderTextColor={colors.theme_fg_four}
              placeholder="******"
              style={styles.textinput}
              onChangeText={(TextInputValue) =>
                this.setState({ password: TextInputValue })
              }
            />
            {/* <View>
              <View style={styles.margin_10} />
              <Text onPress={this.forgot.bind(this)} style={styles.forgot_text}>{strings.forgot_your_password}</Text>
            </View> */}
            <View style={{ marginTop: 50 }} />
            <Text style={styles.description}>
              {
                strings.enter_the_code_you_have_received_by_SMS_in_order_to_verify_account
              }
            </Text>

            <View style={{ margin: 10 }} />
            {this.state.timer == 0 ? (
              <Text
                onPress={this.call_resend.bind(this, this.state.phone_number)}
                style={{
                  fontSize: 15,
                  fontFamily: font_title,
                  color: colors.theme_fg_two,
                  alignSelf: "center",
                  textDecorationLine: "underline",
                }}
              >
                {strings.resend_otp}
              </Text>
            ) : (
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: font_title,
                  color: colors.theme_fg_four,
                  alignSelf: "center",
                }}
              >
                {strings.resend_code_in}
                {this.state.timer}
              </Text>
            )}

            <View style={styles.margin_50} />
            <TouchableOpacity onPress={this.login.bind(this)}>
              <Image
                style={{
                  alignSelf: "flex-end",
                  height: 65,
                  width: 65,
                  tintColor: colors.theme_bg,
                }}
                source={go_icon}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ margin: 25 }} />
        <DropdownAlert
          ref={(ref) => (this.dropDownAlertRef = ref)}
          closeInterval={alert_close_timing}
        />
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    isLoding: state.login.isLoding,
    error: state.login.error,
    data: state.login.data,
    message: state.login.message,
    status: state.login.status,
  };
}

const mapDispatchToProps = (dispatch) => ({
  loginPending: () => dispatch(loginPending()),
  loginError: (error) => dispatch(loginError(error)),
  loginSuccess: (data) => dispatch(loginSuccess(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Password);
const styles = StyleSheet.create({
  margin_10: {
    margin: 10,
  },
  margin_50: {
    margin: 20,
  },
  textinput: {
    borderBottomWidth: 1,
    fontSize: 18,
    color: colors.theme_fg_four,
    fontFamily: font_description,
    borderBottomColor: colors.theme_fg_two,
    borderBottomWidth: 1,
  },
  forgot_text: {
    color: colors.theme_fg_two,
    fontSize: 14,
    fontFamily: font_description,
  },
});
