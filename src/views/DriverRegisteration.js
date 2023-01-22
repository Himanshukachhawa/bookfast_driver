import React, {Component} from 'react';
import { StyleSheet, View, TextInput, Image, TouchableOpacity, Text, Alert } from 'react-native';
import * as colors from '../assets/css/Colors';
import { alert_close_timing,  api_url, font_title, font_description, go_icon, register, get_zones} from '../config/Constants';
import DropdownAlert from 'react-native-dropdownalert';
import { Button } from 'react-native-elements';
import axios from 'axios';
import { connect } from 'react-redux';
import { profilePending, profileError, profileSuccess } from '../actions/ProfileActions';
import Loader from '../components/Loader';
import strings from "../languages/strings.js";
import DateTimePicker from "react-native-modal-datetime-picker";
import { CommonActions } from '@react-navigation/native';
import {Picker} from '@react-native-picker/picker';

 class Register extends Component<Props> { 
  constructor(props) {
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      first_name:'',  
      last_name:'',  
      email:'', 
      phone_number:'',
      country_code: '', 
      phone_with_code:this.props.route.params.phone_with_code,
      country_code:this.props.route.params.country_code,
      phone_number:this.props.route.params.phone_number,
      date_of_birth:'',
      zones:[],
      zone:0,
      licence_number:'',
      gender: '',
      validation:true,
      isLoading:false ,
      deliveryDatePickerVisible : false,
    } 
    this.get_zone_list();
  }

  handleBackButtonClick= () => {
    this.props.navigation.goBack(null);
  }

  gender_list = async(value)=>{
    this.setState({gender : value});
  }

  check_validate = async() =>{
    if( this.state.first_name == "" || this.state.last_name == "" || 
        this.state.password == "" || this.state.gender == "" || this.state.zone == 0 || 
        this.state.email == ""|| this.state.date_of_birth == "" || this.state.licence_number == "" ){
      this.show_alert(strings.please_fill_all_fields);
      this.setState({ validation:false });
    }else{
      this.setState({ validation:true });
      this.register();
    }
  }

  get_zone_list = async () => {
    this.setState({isLoading : true});
    await axios({ 
      method: 'post',  
      url: api_url + get_zones,
      data: { country_code: '+'+this.state.country_code, 
              lang:global.lang
            }
      })
      .then(async response => {  
        this.setState({isLoading : false});
        if(response.data.status == 1){
          this.setState({ zones : response.data.result });
        }
      })
      .catch(error => {
        alert(strings.sorry_something_went_wrong);
        this.setState({isLoading : false});     
      });
  }
  register = async () => {
    this.setState({isLoading : true});
    await axios({ 
    method: 'post',  
    url: api_url + register,
    data: { first_name: this.state.first_name, 
            last_name: this.state.last_name, 
            country_code: '+'+this.state.country_code, 
            phone_with_code: this.state.phone_with_code,
            phone_number: this.state.phone_number, 
            password: this.state.password,
            zone: this.state.zone,
            gender: this.state.gender, 
            email: this.state.email, 
            date_of_birth: this.state.date_of_birth, 
            licence_number: this.state.licence_number, 
            fcm_token:global.fcm_token, daily:1, rental:0, outstation:0
          }
    })
    .then(async response => {  
      this.setState({isLoading : false});
      if(response.data.status == 1){
        Alert.alert(
          strings.success,
          strings.your_registration_is_successfully_completed,
          [
            { text: strings.ok, onPress: () => this.navigate() }
          ],
          { cancelable: false }
        );
      }else{
        alert(response.data.message);
      }
    })
    .catch(error => {
      alert(strings.sorry_something_went_wrong);
      this.setState({isLoading : false});     
    });
  }

  navigate = () => {
    this.props.navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    );
  }

  show_alert = (message) =>{
    this.dropDownAlertRef.alertWithType('error', strings.error,message);
  }

  showDeliveryDatePicker = () => {
  this.setState({ deliveryDatePickerVisible: true });
  };
   
  hideDeliveryDatePicker = () => {
    this.setState({ deliveryDatePickerVisible: false });
  };
   
  handleDeliveryDatePicked = async(date) => {
    this.setState({ deliveryDatePickerVisible: false })
    var d = new Date(date);
    let delivery_date = d.getDate() + '/' + ("0" + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear();
    this.setState({ date_of_birth : delivery_date })
  };

  render() {
    return (
      <View style={{backgroundColor:colors.theme_fg_three,height:"100%",width:"100%" }}>
        <View style={{backgroundColor:colors.theme_fg_three}}> 
          <Loader visible={this.state.isLoading} />
          <View style={{ padding:15 }}>
            <View style={{ flexDirection:'row'}}>
              <View style={{ width:'45%' }}>
                <TextInput
                  placeholder={strings.first_name}
                  placeholderTextColor = {colors.theme_fg_four}
                  style = {styles.textinput}
                  onChangeText={ TextInputValue =>
                    this.setState({first_name : TextInputValue }) }
                />
              </View>
              <View style={{ width:10, flexDirection:'column' }} />
              <View style={{ width:'45%' }}>
                <TextInput
                  placeholder={strings.last_name}
                  placeholderTextColor = {colors.theme_fg_four}
                  style = {styles.textinput}
                  onChangeText={ TextInputValue =>
                    this.setState({last_name : TextInputValue }) }
                />
              </View>
            </View>
            <View style={{margin:10}}/>
            <TextInput
              placeholder={strings.email_id}
              placeholderTextColor = {colors.theme_fg_four}
              style = {styles.textinput}
              onChangeText={ TextInputValue => 
                this.setState({email : TextInputValue }) }
            /> 
            <View style={{margin:10}}/>
            <TextInput
              placeholder={strings.licence_number}
              placeholderTextColor = {colors.theme_fg_four}
              style = {styles.textinput}
              onChangeText={ TextInputValue =>
                this.setState({licence_number : TextInputValue }) }
            /> 
            <View style={{margin:10}}/>
            <TextInput
              placeholder={strings.password}
              secureTextEntry={true}
              placeholderTextColor = {colors.theme_fg_four}
              style = {styles.textinput}
              onChangeText={ TextInputValue =>
                this.setState({password : TextInputValue }) }
            /> 
            <View style={{margin:10}}/>
            <View style={{ flexDirection:'row', width:'100%'}}>
                <View style={{ width:'50%' }}>
                  <Picker
                    selectedValue={this.state.zone}
                    style={{height: 60, width:140, color:colors.theme_fg_two}}
                    onValueChange={(itemValue, itemIndex) =>
                      this.setState({ zone : itemValue })
                    }>
                    <Picker.Item label={strings.zones} value={0} fontSize={18}  />
                    {
                      this.state.zones.map((item, index) => {
                        return <Picker.Item value={item.id} label={item.name} key={index} />
                      })
                    }
                  </Picker>
                </View>
                <View style={{ width:'50%' }}>
                  <Picker
                    selectedValue={this.state.gender}
                    style={{height: 60, width:140, color:colors.theme_fg_two}}
                    onValueChange={(itemValue, itemIndex) =>
                      this.gender_list(itemValue)
                    }>
                    <Picker.Item label={strings.gender} value={0} fontSize={18}  />
                    <Picker.Item label={strings.male} value={1} fontSize={15}  />
                    <Picker.Item label={strings.female} value={2} />
                  </Picker>
                </View>
            </View>
            <View style={{ flexDirection:'row', width:'100%'}}>
              <View style={{ width:'50%', flexDirection:'column'}}>
                <Button
                  title={strings.select_date_of_birth}
                  type="outline"
                  buttonStyle={{ borderColor:colors.theme_fg_three }}
                  titleStyle={{ color:colors.theme_fg, fontFamily:font_title, fontSize:14 }}
                  onPress={this.showDeliveryDatePicker}
                />
                <DateTimePicker
                  isVisible={this.state.deliveryDatePickerVisible}
                  onConfirm={this.handleDeliveryDatePicked}
                  onCancel={this.hideDeliveryDatePicker}
                  mode='date'
                />
                <Text style={styles.delivery_date_text}>{this.state.date_of_birth}</Text>
              </View>
            </View>
            <View style={{margin:5}}/>
            <TouchableOpacity onPress={() => this.check_validate()}>
              <Image style={styles.image} source={go_icon} />
            </TouchableOpacity>
          </View>
        </View>
        <DropdownAlert ref={ref => this.dropDownAlertRef = ref} closeInterval={alert_close_timing} />
      </View>
    );
  }
}
function mapStateToProps(state){
  return{
    isLoding : state.profile.isLoding,
    message : state.profile.message,
    status : state.profile.status,
    data : state.profile.data,
  };
}

const mapDispatchToProps = (dispatch) => ({
    profilePending: () => dispatch(profilePending()),
    profileError: (error) => dispatch(profileError(error)),
    profileSuccess: (data) => dispatch(profileSuccess(data)),
});

export default connect(mapStateToProps,mapDispatchToProps)(Register);

const styles = StyleSheet.create({
  textinput:{
    borderBottomWidth : 1, 
    fontSize:18,
    color:colors.theme_fg_four,
    fontFamily:font_description,
    borderBottomColor:colors.theme_fg_two, 
    borderBottomWidth: 1
  },
  image:{
    alignSelf: 'flex-end',
    height:65,
    width:65 
   },
  delivery_date_text:{
    color:colors.theme_fg, 
    fontFamily:font_description,
    alignSelf:'center',
    fontSize:14
  },

});
