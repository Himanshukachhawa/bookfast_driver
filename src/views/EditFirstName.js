import React, {Component} from 'react';
import { StyleSheet, View, TextInput, Text } from 'react-native';
import * as colors from '../assets/css/Colors';
import { alert_close_timing,  api_url, profile_update,font_title,font_description, height_40 } from '../config/Constants';
import DropdownAlert from 'react-native-dropdownalert';
import { Button } from 'react-native-elements';
import axios from 'axios';
import { connect } from 'react-redux';
import { profilePending, profileError, profileSuccess } from '../actions/ProfileActions';
import Loader from '../components/Loader';
import strings from "../languages/strings.js";

class EditFirstName extends Component<Props> {
  constructor(props) {
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      first_name: this.props.route.params.first_name,
      validation:true,
      isLoding:false
    }
  }

  componentDidMount() {
    setTimeout(() => {
      this.first_name.focus();
    }, 200);
  }

  handleBackButtonClick= () => {
    this.props.navigation.goBack(null);
  }

  check_validate = () =>{
    if(this.state.first_name == ""){
      this.show_alert(strings.please_fill_all_fields);
    }else{
      this.update_data();
    }
  }

  update_data = async () => {
    this.setState({isLoding : true});
     await axios({
      method: 'post', 
      url: api_url + profile_update,
      data:{ driver_id : global.id, first_name : this.state.first_name}
    })
    .then(async response => {
      this.setState({isLoding : false});
      this.handleBackButtonClick();
    })
    .catch(error => {
      alert(strings.sorry_something_went_wrong);
      this.setState({isLoding : false});
    });
  }

  show_alert(message){
    this.dropDownAlertRef.alertWithType('error', strings.error, message);
  }

  render() {
    return (
      <View style={{backgroundColor:colors.theme_fg_three,height:"100%",width:"100%" }}>
        <View style={{backgroundColor:colors.theme_fg_three}}>
          <Loader visible={this.state.isLoding} />
          <View style={{ padding:20, height:height_40 }}>
            <Text style={styles.name_title}>{strings.edit_your_first_name}</Text>
            <View style={styles.margin_10} />
            <TextInput
              ref={ref => this.first_name = ref}
              placeholder={strings.john}
              placeholderTextColor = {colors.theme_fg_four}
              style = {styles.textinput}
              value = {this.state.first_name}
              onChangeText={ TextInputValue =>
                this.setState({first_name : TextInputValue }) }
            />
            <View style={styles.margin_20} />
            <Button
              title={strings.update}
              onPress={this.check_validate}
              buttonStyle={{ backgroundColor:colors.theme_bg }}
               titleStyle={{ fontFamily:font_description,color:colors.theme_fg_three }}
            />
          </View>
        </View>
        <View style={{margin:25}}/>
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

export default connect(mapStateToProps,mapDispatchToProps)(EditFirstName);

const styles = StyleSheet.create({
  name_title:{
    alignSelf:'center', 
    color:colors.theme_fg_two,
    alignSelf:'flex-start', 
    fontSize:20,
    letterSpacing:0.5,
    fontFamily:font_title
  },
  margin_20:{
    margin:20
  },
  margin_10:{
    margin:10
  },
  textinput:{
    borderBottomWidth : 1, 
    fontSize:18,
    color:colors.theme_fg_four,
    fontFamily:font_description
  },
});
