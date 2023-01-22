import React, {Component} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { font_title, font_description, api_url, get_kyc, update_kyc, alert_close_timing, app_name} from '../config/Constants';
import * as colors from '../assets/css/Colors';
import { Input } from 'react-native-elements';
import axios from 'axios';
import Loader from '../components/Loader';
import DropdownAlert from 'react-native-dropdownalert';
import strings from "../languages/strings.js";

class KycVerification extends Component<Props> {
  constructor(props){
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this)
    this.state = {
      bank_name : '', 
      bank_account_number:'',
      ifsc_code:'',
      aadhar_number: '',
      pan_number: '',
      validation:true,
      data:'',
      isLoading:false
    }
  }

  handleBackButtonClick= () => {
    this.props.navigation.goBack(null);
  }

  async componentDidMount(){
    this._unsubscribe=this.props.navigation.addListener('focus',async ()=>{
      await this.get_kyc();
    });
  }

  componentWillUnmount(){
    this._unsubscribe();
  }

  get_kyc = async () => {
    this.setState({ isLoading: true });
    await axios({
      method: 'post', 
      url: api_url+get_kyc,
      data: {driver_id : global.id}
    })
    .then(async response => {
      this.setState({ isLoading: false });
      if(response.data.status == 1){
        this.setState({ bank_name:response.data.result.bank_name, bank_account_number:response.data.result.bank_account_number, ifsc_code:response.data.result.ifsc_code, aadhar_number:response.data.result.aadhar_number,  pan_number:response.data.result.pan_number })
      }
    })
    .catch(error => {
       this.setState({ isLoading: false });
    });
  }

  update_kyc = async () => {
    await this.checkValidate();
    if(this.state.validation){
      this.setState({ isLoding: true });
      await axios({
        method: 'post', 
        url: api_url+update_kyc ,
        data:{driver_id: global.id, bank_name: this.state.bank_name, bank_account_number: this.state.bank_account_number, ifsc_code: this.state.ifsc_code, aadhar_number: this.state.aadhar_number , pan_number: this.state.pan_number }
      })
      .then(async response => {
        this.setState({ isLoding: false });
        alert(strings.details_updated_successfully);
      })
      .catch(error => {
        this.setState({ isLoding: false });
      });
    }
  }

  checkValidate = async() => {
    if(this.state.bank_name == '' || this.state.bank_account_number == '' || this.state.ifsc_code == '' || this.state.aadhar_number == '' || this.state.pan_number == ''){
      this.setState({ validation:false });
      alert(strings.please_fill_all_fields);
    }else{
      this.setState({ validation:true });
    }
  }

 show_alert(message){
    this.dropDownAlertRef.alertWithType('error', strings.error,message);
  }

  render() {
    return (
      <SafeAreaView style={{ backgroundColor:colors.theme_bg_three, flex:1}}>
        <ScrollView>
          <Loader visible={this.state.isLoding} />
            <View>
              <View>
                <Text style={styles.text}>{strings.bank_details}</Text>
                <View style={{ margin:5 }} />
                <Input
                  placeholder={strings.bank_name}
                  placeholderTextColor={colors.theme_fg_four}
                  inputContainerStyle={styles.email_container}
                  inputStyle={styles.email_input}
                  value={this.state.bank_name}
                  onChangeText={ InputTextValue =>
                  this.setState({bank_name : InputTextValue }) }
                />
                <Input
                  placeholder={strings.bank_account_number}
                  placeholderTextColor={colors.theme_fg_four}
                  inputContainerStyle={styles.email_container}
                  inputStyle={styles.email_input}
                  value={this.state.bank_account_number}
                  onChangeText={ InputTextValue =>
                  this.setState({bank_account_number : InputTextValue }) }
                />
                <Input
                  placeholder={strings.ifsc_code}
                  placeholderTextColor={colors.theme_fg_four}
                  inputContainerStyle={styles.email_container}
                  inputStyle={styles.email_input}
                  value={this.state.ifsc_code}
                  onChangeText={ InputTextValue =>
                  this.setState({ifsc_code : InputTextValue }) }
                />
                  <Text style={styles.text}> {strings.KYC_update} </Text>
                <View style={{ margin:5}} />
                <Input
                  placeholder={strings.aadhar_number}
                  placeholderTextColor={colors.theme_fg_four}
                  inputContainerStyle={styles.email_container}
                  inputStyle={styles.email_input}
                  value={this.state.aadhar_number}
                  onChangeText={ InputTextValue =>
                  this.setState({aadhar_number : InputTextValue }) }
                />
                <Input
                  placeholder={strings.PAN_number}
                  placeholderTextColor={colors.theme_fg_four}
                  inputContainerStyle={styles.email_container}
                  inputStyle={styles.email_input}
                  value={this.state.pan_number}
                  onChangeText={ InputTextValue =>
                  this.setState({pan_number : InputTextValue }) }
                />
                <View style={{ margin:5 }}>
                  <Text style={styles.textone}> {strings.by_submitting_you_agree} {app_name} </Text>
                  <Text style={styles.texttwo}> {strings.terms_and_services} </Text>
                </View>
              </View>
            </View> 

          </ScrollView>
           <TouchableOpacity activeOpacity={1} onPress={this.update_kyc} style={styles.footer}>
              <Text style={{ fontSize:14, color:colors.theme_fg_three, fontFamily:font_title }}>{strings.submit}</Text>
          </TouchableOpacity>
        <DropdownAlert ref={ref => this.dropDownAlertRef = ref} closeInterval={alert_close_timing} />
       </SafeAreaView>
    );
  }
}

export default KycVerification;

const styles = StyleSheet.create({
  text:{
    color:colors.theme_fg_two,
    fontSize: 16,
    padding:15,
    fontFamily:font_description
  },
  textone:{
    color:'gray',
    fontSize: 14,
    alignSelf: 'center',
    fontFamily:font_description
  },
  texttwo:{
    color:colors.theme_fg_two,
    fontSize: 14,
    alignSelf: 'center',
    fontFamily:font_description
  },
  email_input:{ 
    color:colors.theme_fg_four,
    fontSize:16,
    fontFamily:font_description
  },
  email_container:{ 
    borderColor:colors.theme_fg_two, 
    borderWidth:1,
    height:40,
    borderRadius:20,
    padding:10,
    width:'90%', 
    marginLeft:'5%',
    color:colors.theme_fg
  },
  footer:{
    backgroundColor:colors.theme_bg,
    alignItems:'center',
    justifyContent:'center',
    height:45,
    width:'100%',
    position:'absolute',
    bottom:0
  }
});