import React, {Component} from 'react';
import { StyleSheet, Text, View} from 'react-native';
import * as colors from '../assets/css/Colors';
import { alert_close_timing, otp_validation_error, font_description, height_40 } from '../config/Constants';
import DropdownAlert from 'react-native-dropdownalert';
import CodeInput from 'react-native-confirmation-code-input';
import strings from "../languages/strings.js";

export default class ForgotOtp extends Component<Props> {
  constructor(props) {
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state={
      otp:this.props.route.params.otp,
      id:this.props.route.params.id
      }
  }

  handleBackButtonClick= () => {
    this.props.navigation.goBack(null);
  }

  async check_otp(code) {
    if (code != this.state.otp) {
      await this.show_alert(otp_validation_error);
    } else {
      this.props.navigation.navigate('ResetPassword', {id: this.state.id});
    }
  }

  show_alert(message){
    this.dropDownAlertRef.alertWithType('error', strings.error,message);
  }

  render() {
    return (
      <View style={{backgroundColor:colors.theme_fg_three,height:"100%",width:"100%" }}>
        <View style={{backgroundColor:colors.theme_fg_three}}>
          <View style={{ padding:20, height:height_40 }}>
            <View>
              <CodeInput
                ref="codeInputRef2"
                keyboardType="numeric"
                codeLength={4}
                className='border-circle'
                autoFocus={false}
                codeInputStyle={{ fontWeight: '800' }}
                activeColor={colors.theme_bg}
                inactiveColor={colors.theme_bg}
                onFulfill={(isValid) => this.check_otp(isValid)}
              />
            </View>
            <View style={styles.margin_10} />
            <Text style={styles.description} >{strings.enter_the_code_you_have_received_by_SMS_for_reset_your_password}</Text>
          </View>
         
        </View>
         <View style={{margin:25}}/>
        <DropdownAlert ref={ref => this.dropDownAlertRef = ref} closeInterval={alert_close_timing} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  margin_10:{
    margin:10
  },
  description:{
    color:colors.theme_fg_four,
    fontFamily:font_description,
    marginTop:30,
    fontSize:14
  }
});
