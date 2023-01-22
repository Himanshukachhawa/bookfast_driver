import React, {Component} from 'react';
import { StyleSheet, Text,  View, FlatList, SafeAreaView, ScrollView, Image } from 'react-native';
import * as colors from '../assets/css/Colors';
import {  car_icon_small, font_title, font_description, my_bookings, api_url, img_url, cancel} from '../config/Constants';
import { Badge } from 'react-native-elements';
import axios from 'axios';
import Moment from 'moment';
import strings from "../languages/strings.js";
import { TouchableOpacity } from 'react-native-gesture-handler';
import Loader from '../components/Loader';

class Bookings extends Component<Props> {
  constructor(props) {
    super(props)
    this.state = {
      isLoading:true,
      data:[]
    }
  }

  async componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener("focus", () => {
      this.get_bookings();
    });
  }

  componentWillUnmount() { 
    this._unsubscribe();
  }

  async get_bookings(){
    this.setState({ isLoading : true });
    await axios({
      method: 'post', 
      url: api_url + my_bookings,
      data:{ driver_id : global.id }
    })
    .then(async response => {
      this.setState({ isLoading : false });
      if(response.data.count > 0){
        this.setState({ data : response.data.result });
      }
    })
    .catch(error => {
      this.setState({ isLoading : false });
    });
  }

  show_alert(message){
    this.dropDownAlertRef.alertWithType('error', strings.error,message);
  }

  ride_details(data){
    this.props.navigation.navigate('RideDetails',{data:data});
  }

  render() {
    return (
      <SafeAreaView style={{ backgroundColor:colors.theme_bg_three, flex:1}}>
        <Loader visible={this.state.isLoading} />
        <ScrollView style={{padding:20}}>
          <FlatList
            data={this.state.data}
              renderItem={({ item,index }) => (
                <TouchableOpacity onPress={this.ride_details.bind(this, item)}>
                  <View style={{ width:'100%',flexDirection: 'row', }}>
                    <View style={{ width:'10%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                      <Image square source={car_icon_small} style={{ height:25, width:25 }} />
                    </View>
                  <View style={{ width:'70%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                    <Text style={styles.date_time}>{Moment(item.pickup_date).format('MMM DD, YYYY hh:mm A')}</Text>
                    <Text style={styles.mini}>{item.vehicle_type}. #{item.trip_id}</Text>
                    <View style={{ margin:3 }} />
                    {item.status >=6  &&
                      <View style={{position:'absolute', right:10}}>
                        <Image square source={cancel} style={{ height:40, width:50 }} />
                      </View>
                    }
                    <View style={{ flexDirection:'row', alignItems:'center' }}>
                      <Badge status="success" />
                      <View style={{ marginLeft : 5}} />
                      {item.status < 6 ?
                        <Text style={styles.address}>{item.actual_pickup_address}</Text>
                        :
                        <Text style={styles.address}>{item.pickup_address}</Text>
                      }
                    </View>
                    <View style={{ borderLeftWidth:1, height:10, marginLeft:3 }} />
                    <View style={{ flexDirection:'row', alignItems:'center' }}>
                      <Badge status="error" />
                      <View style={{ marginLeft : 5}} />
                      {item.status < 6 ?
                        <Text style={styles.address}>{item.actual_drop_address}</Text>
                      :
                        <Text style={styles.address}>{item.drop_address}</Text>
                      }
                    </View>
                  </View>
                  <View style={{ width:'20%', alignItems:'flex-end', justifyContent:'center' }}>
                    {item.status <6 ?
                    <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
                      <Text style={styles.amt}>{global.currency}{item.total}</Text>
                    </View>
                    :
                    <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
                      <Text style={styles.amt}>{global.currency}0</Text>
                    </View>
                  }
                    <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', marginBottom:0}}>
                      <Image source={{ uri : img_url + item.profile_picture }} style={{ height:30, width:30, borderRadius:15 }} />
                    </View>
                    
                  </View>
                </View>
                <View style={{ borderBottomWidth:0.3, borderColor:colors.theme_fg_four, marginBottom:15, marginTop:15}}></View>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
          />
          <View style={{ alignItems:'center', marginTop:'60%'}}>
            {this.state.data.length == 0 && 
              <Text style={{ fontSize:16, fontFamily:font_title, color:colors.theme_fg_two }}>{strings.no_ride_found}</Text>
            }
          </View>
        </ScrollView>
        <View style={{ margin:50}}/>
        </SafeAreaView>
    );
  }
}

export default Bookings;

const styles = StyleSheet.create({
  date_time:{ 
    fontSize:14, 
    fontFamily:font_title, 
    color:colors.theme_fg_two,  
    alignItems: 'flex-start'
  },
  mini:{ 
    fontSize:12, 
    color:colors.theme_fg_two,  
    fontFamily:font_description,
    alignItems: 'flex-start'
  },
  address:{ fontSize:11, color:colors.theme_fg_four,  fontFamily:font_description },
  amt:{ fontSize:16, fontFamily:font_title, color:colors.theme_fg_two },
  });
