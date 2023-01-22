import React, {Component} from 'react';
import { StyleSheet, View, Switch, SafeAreaView, isEnabled, Text  } from 'react-native';
import * as colors from '../assets/css/Colors';
import axios from 'axios';
import { api_url, shared_ride_status, update_shared_ride_status, img_url, font_title, font_description  } from '../config/Constants';
import Loader from '../components/Loader';
import strings from "../languages/strings.js";
import Icon, { Icons } from '../components/Icons';

export default class SharedSettings extends Component {
  constructor(props) {
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      isLoading:false,
    }
  }

  handleBackButtonClick = () => {
    this.props.navigation.goBack(null);
  };

  async componentDidMount(){
    this._unsubscribe = await this.props.navigation.addListener("focus", async() => {
      this.view_shared_ride_status();
    });
  }
  
  view_shared_ride_status = async () => {
    this.setState({ isLoading: true });
    await axios({
      method: 'post', 
      url: api_url + shared_ride_status,
      data: {driver_id:global.id}
    })
    .then(async response => {
      this.setState({ isLoading: false });
      if(response.data.data == 1){
        this.setState({shared_status: true}); 
      }else if(response.data.data == 0){
        this.setState({shared_status: false}); 
      }
    })
    .catch(error => {
      this.setState({ isLoading: false });
      alert(strings.sorry_something_went_wrong);
    });
  }

  toggleSwitch = (value) => {
    if(value){
      this.setState({shared_status: value});
      this.change_shared_ride_status(1);
    }else{
      this.setState({shared_status: value})
      this.change_shared_ride_status(0);
    }  
    
  }

  change_shared_ride_status = async (status) => {
    this.setState({ isLoading:true})
    await axios({
      method: 'post', 
      url: api_url + update_shared_ride_status,
      data:{ driver_id: global.id, shared_ride_status : status }
    })
    .then(async response => {
      this.setState({ isLoading:false});
      if(response.data.data == 0){
        this.setState({shared_status:false});
        this.view_shared_ride_status();
      }else if(response.data.data == 1){
        this.setState({shared_status:true});
        this.view_shared_ride_status();
      }
    })
    .catch(error => {
        this.setState({ isLoading: false });
        alert(strings.sorry_something_went_wrong);
    });
  }

  render() {
    return (
      <SafeAreaView style={{ backgroundColor:colors.theme_bg_three, flex:1}}>
        <Loader visible={this.state.isLoading} />
        <View style={{ margin:10 }} />
            <View style={{ flexDirection:'row', width:'100%', padding:10}}>
                <View style={{width:'70%'}}>
                    <Text style={{ fontFamily:font_title, fontSize:18, color:colors.theme_fg_two}}>Enable Shared ride status</Text>
                </View>
                <View style={{width:'30%'}}>
                    <Switch
                        trackColor={{ false: "#C0C0C0", true: "#fcdb00" }}
                        thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={this.toggleSwitch}
                        value={this.state.shared_status}
                    /> 
                </View>
            </View>
            <View style={{ margin:10 }} />
      </SafeAreaView>
    
    );
  }
}  

const styles = StyleSheet.create({

});


