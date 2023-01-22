import React, {Component} from 'react';
import { StyleSheet, Text, View} from 'react-native';
import * as colors from '../assets/css/Colors';
import { alert_close_timing, font_description, height_37, check_phone, api_url, forgot, font_title } from '../config/Constants';
import DropdownAlert from 'react-native-dropdownalert';
import CodeInput from 'react-native-confirmation-code-input';
import strings from "../languages/strings.js";
import axios from 'axios';
import Loader from '../components/Loader';

class Otp extends Component<Props> {

  constructor(props) {
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      otp:this.props.route.params.otp,
      phone_with_code:this.props.route.params.phone_with_code,
      country_code:this.props.route.params.country_code,
      phone_number:this.props.route.params.phone_number,
      id:this.props.route.params.id,
      from:this.props.route.params.from,
      timer: 30,
      isLoading:false
      }
      console.log(this.state.otp)
  }

  componentDidMount() {
      if(global.mode == 'DEMO'){
        setTimeout(() => {
          this.check_otp(this.state.otp);
        }, 1000)
      }else{
        this.start_timer()
      }
  }

  start_timer(){
    this.clockCall = setInterval(() => {
      this.decrementClock();
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.clockCall);
  }

  decrementClock = () => {   
    if(this.state.timer < 1){
      clearInterval(this.clockCall);
    }else{
      this.setState((prevstate) => ({ timer: prevstate.timer-1 }));
    }   
  };

  handleBackButtonClick= () => {
    this.props.navigation.goBack(null);
  }

  async check_phone_forgot(phone_with_code){
    this.setState({ isLoading:true })
    await axios({
      method: 'post', 
      url: api_url + forgot,
      data:{ phone_with_code : phone_with_code}
    })
    .then(async response => {
      this.setState({ isLoading:false })
      if(response.data.status == 1){
        this.setState({ otp : response.data.result.otp, timer:30 })
        this.start_timer();
      }
    })
    .catch(error => {
      this.setState({ isLoading:false })
      alert('Sorry somethin went wrong');
    });
  }

  async check_phone_register(phone_with_code){
    this.setState({ isLoading:true })
    await axios({
      method: 'post', 
      url: api_url + check_phone,
      data:{ phone_with_code : phone_with_code}
    })
    .then(async response => {
      this.setState({ isLoading:false })
      if(response.data.status == 1){
        this.setState({ otp : response.data.result.otp, timer:30 })
        this.start_timer();
      }
    })
    .catch(error => {
      this.setState({ isLoading:false })
      alert(strings.sorry_something_went_wrong);
    });
  }

  async check_otp(code) {
    if(code != this.state.otp) {
      this.show_alert(strings.please_enter_valid_otp);
    } else {
      if(this.state.from == "login"){
        this.props.navigation.navigate('DriverRegisteration', {phone_with_code :this.state.phone_with_code, country_code: this.state.country_code, phone_number: this.state.phone_number});
      }else{
        this.props.navigation.navigate('ResetPassword', {id: this.state.id});
      }
    }
  }

  call_resend(phone_with_code){
    if(this.state.from == "login"){
      this.check_phone_register(phone_with_code)
    }else{
      this.check_phone_forgot(phone_with_code)
    }
  }

  show_alert(message){
    this.dropDownAlertRef.alertWithType('error', strings.error,message);
  }

  render() {
    return (
     <View style={{backgroundColor:colors.theme_fg_three,height:"100%",width:"100%" }}>
       <Loader visible={this.state.isLoading} />
        <View style={{backgroundColor:colors.theme_fg_three}}>
          <View style={{ padding:20, height:height_37 }}>
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
            <View style={{marginTop:50}} />
            <Text style={styles.description} >{strings.enter_the_code_you_have_received_by_SMS_in_order_to_verify_account}</Text>
          </View>
          <View style={{ margin:10 }} />
            {this.state.timer == 0 ? 
            <Text onPress={this.call_resend.bind(this,this.state.phone_with_code)} style={{ fontSize:15, fontFamily:font_title, color:colors.theme_fg_two, alignSelf:'center', textDecorationLine: 'underline'}} >{strings.resend_otp}</Text>
            :
            <Text style={{ fontSize:15, fontFamily:font_title, color:colors.theme_fg_four, alignSelf:'center'}} >{strings.resend_code_in}{this.state.timer}</Text>
            }
        </View>
        <DropdownAlert ref={ref => this.dropDownAlertRef = ref} closeInterval={alert_close_timing} />
      </View>
    );
  }
}

export default Otp;

const styles = StyleSheet.create({
  description:{
    color:colors.theme_fg_two,
    fontFamily:font_description,
    fontSize:14,
  }
});
