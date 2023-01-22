import React, {Component} from 'react';
import { StyleSheet, Image, View, TextInput,TouchableOpacity, SafeAreaView, ScrollView, Text } from 'react-native';
import * as colors from '../assets/css/Colors';
import { alert_close_timing, font_title, font_description, height_40, height_10, go_icon, reset_password, api_url  } from '../config/Constants';
import DropdownAlert from 'react-native-dropdownalert';
import axios from 'axios';
import Loader from '../components/Loader';
import strings from "../languages/strings.js";

export default class CreatePassword extends Component<Props> {
  constructor(props) {
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      password: '',
      confirm_password:'',
      validation:false,
      isLoading: false,
      id:this.props.route.params.id
    }
  }
  
  componentDidMount() {
    setTimeout(() => {
      this.password.focus();
    }, 200);
  }

  handleBackButtonClick= () => {
    this.props.navigation.goBack(null);
  }

  async check_validate(){
    if(this.state.password == "" || this.state.confirm_password == ""){
      this.setState({ validation:false });
      this.show_alert(strings.please_fill_all_fields);
    }else if(this.state.password != this.state.confirm_password ){
      this.setState({ validation:false });
      this.show_alert(strings.both_password_is_not_same);
    }else{
      this.setState({ validation:true });
      this.reset_password();
    }
  }

  show_alert(message){
    this.dropDownAlertRef.alertWithType('error', strings.error,message);
  }

  reset_password = async () => {
    this.setState({isLoading:true});
    await axios({
      method: 'post', 
      url: api_url + reset_password,
      data: {id :  this.state.id, password: this.state.password }
    })
    .then(async response => {
      this.setState({isLoading:false});
      alert('Successfully Changed');
      this.props.navigation.navigate('LoginHome');
    })
    .catch(error => {
      alert(strings.sorry_something_went_wrong);
      this.setState({isLoading:false});
    });
  }

  render() {
    return (
      <SafeAreaView style={{ backgroundColor:colors.theme_bg_three, flex:1}}>
        <Loader visible={this.state.isLoading} />
        <ScrollView>
          <View style={{ padding:20, height:height_40 }}>
            <Text style={styles.password_title}>{strings.enter_your_new_password}</Text>
            <View style={styles.margin_10} />
            <View style={{flexDirection:'row', width:'100%'}}>
              <View style={{flexDirection:'column', width:'48%'}}>
                <TextInput
                  ref={ref => this.password = ref}
                  secureTextEntry={true}
                  placeholder={strings.password}
                  placeholderTextColor = {colors.theme_fg_four}
                  style = {styles.textinput}
                  onChangeText={ TextInputValue =>
                      this.setState({password : TextInputValue }) }
                />
              </View>
            <View style={{ width:10, flexDirection:'column' }} />
            <View style={{flexDirection:'column'}}>
              <TextInput
                ref={ref => this.confirm_password = ref}
                secureTextEntry={true}
                placeholder={strings.confirm_Password}
                placeholderTextColor = {colors.theme_fg_four}
                style = {styles.textinput}
                onChangeText={ TextInputValue =>
                    this.setState({confirm_password : TextInputValue }) }
              />
            </View>
            </View>
            <View style={styles.margin_50} />
            <TouchableOpacity onPress={this.check_validate.bind(this)}>
              <Image style={{ alignSelf: 'flex-end', height:65, width:65}} source={go_icon}/>
            </TouchableOpacity>  
          </View>
          <View style={{ height:height_10 }} />
        </ScrollView>
        <DropdownAlert ref={ref => this.dropDownAlertRef = ref} closeInterval={alert_close_timing} />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  password_title:{
    alignSelf:'center', 
    color:colors.theme_fg_two,
    alignSelf:'flex-start', 
    fontSize:20,
    letterSpacing:0.5,
    fontFamily:font_title
  },
  margin_10:{
    margin:10
  },
  margin_50:{
    margin:20
  },
  textinput:{
    borderBottomWidth : 1, 
    fontSize:17,
    color:colors.theme_fg_four,
    fontFamily:font_description,
    borderBottomColor:colors.theme_fg_two, 
    borderBottomWidth: 1
  }
  
});
