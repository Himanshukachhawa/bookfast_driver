import React, {Component} from 'react';
import { StyleSheet, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { height_20, api_url, checkin, font_description } from '../config/Constants';
import * as colors from '../assets/css/Colors';
import { CommonActions } from '@react-navigation/native';
import axios from 'axios'; 
import strings from "../languages/strings.js";
import Loader from '../components/Loader';

export default class Logout extends Component<Props> {
  static navigationOptions = {
    header:null
  }

  constructor(props) {
    super(props)
    this.state = {
      isLoading:false
      }
  }
  
  async componentWillMount(){
    await this.status_change(0);
    global.live_status = 0;
    await AsyncStorage.clear();
    this.resetMenu();
  }

  resetMenu() {
    this.props.navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "LoginHome" }],
      })
    );
  }

  status_change = async (status) => {
    this.setState({ isLoading:true})
    await axios({
      method: 'post', 
      url: api_url + checkin,
      data:{ id: global.id, online_status : status }
    })
    .then(async response => {
      this.setState({ isLoading:false});
    })
    .catch(error => {
      this.setState({ isLoading:false});
    });
  }

  render () {
    return (
      <View style={styles.container} >
        <Loader visible={this.state.isLoading} />
        <View style={{ marginTop:height_20 }} >
          <Text style={{ fontSize:20, color:colors.theme_fg_two, fontFamily:font_description }}>{strings.please_wait}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:'#FFFFFF'
  }
});