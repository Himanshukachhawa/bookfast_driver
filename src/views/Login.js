import React, { Component } from "react";
import {
  StyleSheet,
  Image,
  View,
  TouchableOpacity,
  TextInput,
} from "react-native";
import * as colors from "../assets/css/Colors";
import {
  api_url,
  check_phone,
  alert_close_timing,
  font_description,
  height_40,
  go_icon,
} from "../config/Constants";
import PhoneInput from "react-native-phone-input";
import DropdownAlert from "react-native-dropdownalert";
import axios from "axios";
import { connect } from "react-redux";
import {
  checkPhonePending,
  checkPhoneError,
  checkPhoneSuccess,
} from "../actions/CheckPhoneActions";
import {
  createCountryCode,
  createPhoneNumber,
  createPhoneWithCode,
} from "../actions/RegisterActions";
import { StatusBar } from "../components/GeneralComponents";
import Loader from "../components/Loader";
import strings from "../languages/strings.js";

class Login extends Component<Props> {
  constructor(props) {
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      phone_number: "",
      validation: false,
      isLoading: false,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      //this.phone.focus();
    }, 200);
  }

  handleBackButtonClick = () => {
    this.props.navigation.goBack(null);
  };

  async navigate(data) {
    // if (data?.is_available == 1) {
    //   this.props.navigation.navigate("Password", {
    //     phone_number: this.phone.getValue(),
    //   });
    // } else {
    //   let phone_number = this.phone.getValue();
    //   phone_number = phone_number.replace(
    //     "+" + this.phone.getCountryCode(),
    //     ""
    //   );
    //   await this.props.createCountryCode("+" + this.phone.getCountryCode());
    //   await this.props.createPhoneNumber(phone_number);
    //   await this.props.createPhoneWithCode(this.phone.getValue());
    //   await this.props.navigation.navigate("Otp", {
    //     otp: data.otp,
    //     phone_with_code: this.phone.getValue(),
    //     country_code: this.phone.getCountryCode(),
    //     phone_number: phone_number,
    //     id: 0,
    //     from: "login",
    //   });
    // }
    this.props.navigation.navigate("Password", {
      phone_number: "+91" + this.state.phone_number,
    });
  }

  async check_phone(phone_with_code) {
    console.log(phone_with_code?.slice(3));
    this.setState({ isLoading: true });
    this.props.checkPhonePending();
    await axios({
      method: "post",
      url: api_url + check_phone,
      data: { phone_with_code: phone_with_code, fcm_token: global.fcm_token },
    })
      .then(async (response) => {
        console.log("s", response);
        this.setState({ isLoading: false });
        await this.props.checkPhoneSuccess(response.data);
        this.navigate(response.data.result);
      })
      .catch((error) => {
        this.setState({ isLoading: false });
        alert(strings.sorry_something_went_wrong);
        this.props.checkPhoneError(error);
      });
  }

  async check_validate() {
    if (this.state.phone_number == "") {
      this.setState({ validation: false });
      this.show_alert(strings.please_enter_valid_phone_number);
    } else {
      this.setState({ validation: true });
      this.check_phone(this.state.phone_number);
    }
  }

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
        <StatusBar />
        <Loader visible={this.state.isLoading} />
        <View>
          <View style={{ margin: 10 }} />
          <View style={{ padding: 20, height: height_40 }}>
            {/* <PhoneInput
              flagStyle={styles.flag_style}
              ref={(ref) => {
                this.phone = ref;
              }}
              initialCountry="in"
              offset={10}
              textStyle={styles.country_text}
              textProps={{
                placeholder: strings.phone_number,
                placeholderTextColor: colors.theme_fg_four,
              }}
              autoFormat={true}
            /> */}
            <TextInput
              value={this.state.phone_number}
              placeholder={"+91"}
              keyboardType={"number-pad"}
              maxLength={10}
              onChangeText={(text) => {
                this.setState({ phone_number: text });
              }}
              style={{ borderBottomColor: "#000", borderBottomWidth: 1 }}
            />
            <View style={styles.margin_50} />
            {/*<ActionButton
                  buttonColor={colors.theme_bg}
                  onPress={this.check_phone_number.bind(this)}
                  position="right"
                  icon={
                    <Icon style={{ color:colors.theme_fg_three}} name='arrow-forward' />
                  }
                />*/}
            <TouchableOpacity onPress={this.check_validate.bind(this)}>
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
    isLoding: state.check_phone.isLoding,
    error: state.check_phone.error,
    data: state.check_phone.data,
    message: state.check_phone.message,
    status: state.check_phone.status,
  };
}

const mapDispatchToProps = (dispatch) => ({
  checkPhonePending: () => dispatch(checkPhonePending()),
  checkPhoneError: (error) => dispatch(checkPhoneError(error)),
  checkPhoneSuccess: (data) => dispatch(checkPhoneSuccess(data)),
  createCountryCode: (data) => dispatch(createCountryCode(data)),
  createPhoneNumber: (data) => dispatch(createPhoneNumber(data)),
  createPhoneWithCode: (data) => dispatch(createPhoneWithCode(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);

const styles = StyleSheet.create({
  margin_50: {
    margin: 25,
  },
  flag_style: {
    width: 38,
    height: 24,
  },
  country_text: {
    fontSize: 18,
    borderBottomWidth: 1,
    paddingBottom: 8,
    height: 35,
    fontFamily: font_description,
    color: colors.theme_fg_two,
  },
});
