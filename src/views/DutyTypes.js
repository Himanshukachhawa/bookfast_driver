import React, {Component} from 'react';
import { StyleSheet, Text, Image, View, Switch, isEnabled, SafeAreaView, ScrollView } from 'react-native';
import * as colors from '../assets/css/Colors';
import { font_title, api_url, daily, outstation, rental, profile_update, profile } from '../config/Constants';
import axios from 'axios';
import strings from "../languages/strings.js";
export default class DutyTypes extends Component<Props> { 

  constructor(props) {
    super(props)
    this.state = {
      daily: false,
      rental:false,
      outstation:false
    }
  }

  async componentDidMount(){
  this._unsubscribe=this.props.navigation.addListener('focus',async ()=>{
    await this.get_profile();
  });
  }

  componentWillUnmount(){
    this._unsubscribe();
  }

  handleBackButtonClick= () => {
      this.props.navigation.goBack(null);
  }

  daily_toggleSwitch = (value) => {
    if(value){
      this.setState({daily: value});  
    }else{
      this.setState({daily: value})
    }  
  }

  rental_toggleSwitch = (value) => {
    if(value){
      this.setState({rental: value});  
    }else{
      this.setState({rental: value})
    }  
  }

  outstation_toggleSwitch = (value) => {
    if(value){
      this.setState({outstation: value});  
    }else{
      this.setState({outstation: value})
    }  
  }

  duty_select = async () => {
    await axios({
      method: 'post', 
      url: api_url + profile_update,
      data:{ driver_id : global.id, daily: Number(this.state.daily), rental: Number(this.state.rental), outstation: Number(this.state.outstation)}
    })
    .then(async response => {
        this.setState({ daily: response.data.result.daily, rental: response.data.result.rental, outstation: response.data.result.outstation});
        this.handleBackButtonClick();
    })
    .catch(error => {
        alert(error);
    });
  }

    get_profile = async () => {
     await axios({
      method: 'post', 
      url: api_url + profile,
      data:{ driver_id : global.id}
    })
    .then(async response => {
        //alert(JSON.stringify(Boolean(response.data.result.daily)));
        this.setState({ daily: Boolean(response.data.result.daily), rental: Boolean(response.data.result.rental), outstation: Boolean(response.data.result.outstation)})
    })
    .catch(error => {
        alert(strings.sorry_something_went_wrong);
    });

  }
 render() {
    return (
      <SafeAreaView>
        <ScrollView style={{padding:10}}>
        <View style={{marginTop: 20}}/>
          <View style={{padding: 10, flexDirection:'row'}}>
            <View style={{ width:'30%', flexDirection:'column'}}> 
              <Image 
                style= {{height:50, width:70 }}
                source={daily}
              />
            </View>
            <View style={{ width:'40%'}}>
              <Text style={{fontSize:18, color:'#FFFFFF', fontFamily:font_title, marginTop:20 }}>Daily</Text>
            </View>
            <View style={{ width:'30%', marginTop:20}}>
              <Switch
                trackColor={{ false: "#C0C0C0", true: "#fcdb00" }}
                thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={this.daily_toggleSwitch}
                value={this.state.daily}
              />
            </View>
          </View>
          <View style={{padding: 10, flexDirection:'row'}}>
            <View style={{ width:'30%', flexDirection:'column'}}> 
              <Image 
                style= {{height:50, width:70 }}
                source={rental}
              />
            </View>
            <View style={{ width:'40%', flexDirection:'column'}}>
              <Text style={{fontSize:18, color:'#FFFFFF', fontFamily:font_title, marginTop:20 }}>Rental</Text>
            </View>
            <View style={{ width:'30%', marginTop:20, flexDirection:'column'}}>
              <Switch
                trackColor={{ false: "#C0C0C0", true: "#fcdb00" }}
                thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={this.rental_toggleSwitch}
                value={this.state.rental}
              />
            </View>
          </View>
          <View style={{padding: 10, flexDirection:10}}>
            <View style={{ width:'30%', flexDirection:'column'}}> 
              <Image 
                style= {{height:50, width:70 }}
                source={outstation}
              />
            </View>
            <View style={{ width:'40%', flexDirection:'column'}}>
              <Text style={{fontSize:18, color:'#FFFFFF', fontFamily:font_title, marginTop:20 }}>Outstation</Text>
            </View>
            <View style={{ width:'30%', marginTop:20, flexDirection:'column'}}>
              <Switch
                trackColor={{ false: "#C0C0C0", true: "#fcdb00" }}
                thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={this.outstation_toggleSwitch}
                value={this.state.outstation}
              />
            </View>
          </View>
          </ScrollView>
        </SafeAreaView>

    );
  }
}

const styles = StyleSheet.create({
  header:{
    backgroundColor:colors.theme_bg_three
  },
  header_body: {
    flex: 3,
    justifyContent: 'center'
  },
  title:{
    alignSelf:'center', 
    color:colors.theme_fg_two,
    alignSelf:'center', 
    fontSize:20, 
    fontFamily:font_title
  },
  apply:{
    alignSelf:'center', 
    color:colors.theme_fg_two,
    alignSelf:'center', 
    fontSize:18, 
    fontFamily:font_title
  },  
});
