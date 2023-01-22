import React, {Component} from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, SafeAreaView, ScrollView } from 'react-native';
import * as colors from '../assets/css/Colors';
import { alert_close_timing,  api_url, font_title, font_description, vehicle_type_list, vehicle_update, vehicle_details} from '../config/Constants';
import DropdownAlert from 'react-native-dropdownalert';
import axios from 'axios'; 
import { connect } from 'react-redux';
import { profilePending, profileError, profileSuccess } from '../actions/ProfileActions';
import Loader from '../components/Loader';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import strings from "../languages/strings.js";
import {Picker} from '@react-native-picker/picker';

class VehicleDetails extends Component<Props> { 
  constructor(props) {
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = { 
      validation:true,
      isLoading:false ,
      vehicle_type:'',
      brand:'',
      color:'',
      vehicle_name:'',
      vehicle_number:'',
      vehicle_type_result:[],
      result:undefined,
      vehicle_status:'',
      api_status:0,
    } 
    this.vehicle_type_list();
  }

  handleBackButtonClick= () => {
    this.props.navigation.goBack(null);
  }

  async componentDidMount(){
    this._unsubscribe=this.props.navigation.addListener('focus',async ()=>{
      //await this.get_Vehicle_details();
    });
  }

  componentWillUnmount(){
    this._unsubscribe();
  }

  vehicle_list = async(value)=>{
    this.setState({vehicle_type : value});
  }

  vehicle_type_list = async () => {
    await axios({
      method: 'post', 
      url: api_url + vehicle_type_list,
      data:{ country_id : global.country_id, lang: global.lang}
    })
    .then(async response => {
      this.setState({vehicle_type_result: response.data.result})
    })
    .catch(error => {
      alert(strings.sorry_something_went_wrong);
    });
  }

  async check_validate(){
    if( this.state.brand == "" || this.state.color == "" || 
        this.state.vehicle_name == "" || 
        this.state.vehicle_type == ""|| this.state.vehicle_number == ""  ){
      await this.show_alert(strings.please_fill_all_fields);
      this.setState({ validation:false });
    }else{
      this.setState({ validation:true });
    }
  }

  vehicle_update = async () => {
    this.check_validate();
    console.log({ country_id:global.country_id, driver_id:global.id, vehicle_type:this.state.vehicle_type, brand:this.state.brand,
      color:this.state.color, vehicle_name:this.state.vehicle_name, vehicle_number:this.state.vehicle_number});
    if(this.state.validation){
      this.setState({isLoading:true});
      await axios({
        method: 'post', 
        url: api_url + vehicle_update,
        data:{ country_id:global.country_id, driver_id:global.id, vehicle_type:this.state.vehicle_type, brand:this.state.brand,
              color:this.state.color, vehicle_name:this.state.vehicle_name, vehicle_number:this.state.vehicle_number}
      })
      .then(async response => {
        this.setState({isLoading:false});
        this.navigate();
      })
      .catch(error => {
        this.setState({isLoading:false});
        alert(strings.sorry_something_went_wrong);
      });
    }
  }


  navigate = () => {
    this.props.navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Document" }],
      })
    );
  }

  get_Vehicle_details = async () => {
    await axios({
      method: 'post', 
      url: api_url + vehicle_details,
      data:{ driver_id : global.id}
    })
    .then(async response => {
      if(response.data.status != 0){
        this.setState({brand: response.data.result.brand, color:response.data.result.color, vehicle_name:response.data.result.vehicle_name, vehicle_number:response.data.result.vehicle_number, vehicle_status:response.data.result.status})
      }
    })
    .catch(error => {
        alert(strings.sorry_something_went_wrong);
    });
  }

  render() {
    return (
      <SafeAreaView style={{ height:'100%', width:'100%'}}>
        <ScrollView >
          <View > 
            <Loader visible={this.state.isLoding} />
            <View style={{ padding:15 }}>
              <Text style={styles.name_title}>{strings.vehicle_name}</Text>
              <TextInput
                placeholder={strings.enter_your_vehicle_name}
                placeholderTextColor = {colors.theme_fg_four}
                style = {styles.textinput}
                value = {this.state.vehicle_name}
                onChangeText={ TextInputValue =>
                  this.setState({vehicle_name : TextInputValue }) }
              /> 
              <View style={{margin:10}}/>
              <Text style={styles.name_title}>{strings.vehicle_brand}</Text>
              <TextInput
                placeholder={strings.enter_your_vehicle_brand}
                placeholderTextColor = {colors.theme_fg_four}
                style = {styles.textinput}
                value = {this.state.brand}
                onChangeText={ TextInputValue =>
                  this.setState({brand : TextInputValue }) }
              />
              <View style={{margin:10}}/>
              <Text style={styles.name_title}>{strings.vehicle_color}</Text>
              <TextInput
                placeholder={strings.enter_your_vehicle_color}
                placeholderTextColor = {colors.theme_fg_four}
                style = {styles.textinput}
                value = {this.state.color}
                onChangeText={ TextInputValue => 
                  this.setState({color : TextInputValue }) }
              /> 
              <View style={{margin:10}}/>
              <Text style={styles.name_title}>{strings.vehicle_number}</Text>
              <TextInput
                placeholder={strings.enter_your_vehicle_number}
                placeholderTextColor = {colors.theme_fg_four}
                style = {styles.textinput}
                value = {this.state.vehicle_number}
                onChangeText={ TextInputValue =>
                  this.setState({vehicle_number : TextInputValue }) }
              /> 
              <View style={{margin:10}}/>
              <Text style={styles.name_title}>{strings.vehicle_type}</Text>
              <Picker
                selectedValue={this.state.vehicle_type}
                style={{height: 60, width:200, color:colors.theme_fg_two}}
                onValueChange={(itemValue, itemIndex) =>
                  this.vehicle_list(itemValue)
                }>
                {this.state.vehicle_type_result.map((row, index) => (
                  <Picker.Item label={row.vehicle_type} value={row.id} fontSize={18} color={colors.theme_fg_two} />
                ))}
              </Picker>
              <View style={{margin:15}}/>
            </View>
          </View>
          <DropdownAlert ref={ref => this.dropDownAlertRef = ref} closeInterval={alert_close_timing} />
          <Loader visible={this.state.isLoading} />
        </ScrollView>
        { this.state.vehicle_status != 16 &&
          <TouchableOpacity style={styles.footer} >
            <TouchableOpacity activeOpacity={1} onPress={() => this.vehicle_update()} style={styles.footer_content}>
                <Text style={{ fontSize:20, color:colors.theme_fg_three, fontFamily:font_title }}>{strings.update}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        }
      </SafeAreaView>
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

export default connect(mapStateToProps,mapDispatchToProps)(VehicleDetails);

const styles = StyleSheet.create({
  name_title:{
    alignSelf:'center', 
    color:colors.theme_fg_two,
    alignSelf:'flex-start', 
    fontSize:20,
    letterSpacing:0.5,
    fontFamily:font_title
  },
  textinput:{
    borderBottomWidth : 1, 
    fontSize:18,
    color:colors.theme_fg_four,
    fontFamily:font_description,
    borderBottomColor:colors.theme_fg_two,
    borderBottomWidth: 1
  },
  footer:{
    backgroundColor:colors.theme_bg,
    alignItems:'center',
    justifyContent:'center',
    height:50,
    padding:10,
    position:'absolute',
    bottom:0,
    width:'100%',
    alignItems:'center',
    justifyContent:'center'
  },
  footer_content:{
    width:'90%',
    alignItems:'center',
    justifyContent:'center'
  },
});
