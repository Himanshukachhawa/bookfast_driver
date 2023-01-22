import React, {Component} from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Image } from 'react-native';
import * as colors from '../assets/css/Colors';
import { car_icon_small, meter_icon, font_title, font_description, img_url, cancel} from '../config/Constants';
import { Badge, Divider } from 'react-native-elements';
import Moment from 'moment';
import strings from "../languages/strings.js";
import StarRating from 'react-native-star-rating';

class RideDetails extends Component<Props> {
  constructor(props) {
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      data:this.props.route.params.data
    }
  }

  handleBackButtonClick= () => {
    this.props.navigation.goBack(null);
  }

  show_alert(message){
    this.dropDownAlertRef.alertWithType('error', strings.error,message);
  }

  support(item){
    this.props.navigation.navigate('ComplaintCategory');
  }

  render() {
    return (
      <SafeAreaView style={{ backgroundColor:colors.theme_bg_three, flex:1}}>
        <ScrollView style={{padding:10}}>
          <View style={{ padding:10 }}>
            <View style={{flexDirection:'row'}}>
              <View style={{ width:'25%', flexDirection:'column'}}>
                <Image source={{uri:img_url + this.state.data.profile_picture}} style={{ height:50, width:50, borderRadius:30 }} />
              </View>
              <View style={{ justifyContent:'center', flexDirection:'column' }}>
                <Text style={styles.cab_driver}>{this.state.data.customer_name}</Text>
                <View style={{ margin:3 }} />
                  <View style={{ flexDirection:'row', alignItems:'center'}} >
                    <StarRating
                      disabled={true}
                      maxStars={5}
                      starSize={10}
                      rating={this.state.data.customer_rating}
                      starStyle={{ paddingRight:5, color:colors.star_rating }}
                    /> 
                    <Text style={styles.rate}> ({strings.you_rated})</Text>
                  </View>
              </View>
            </View>
            <Divider style={styles.default_divider} />
            <View style={{flexDirection:'row'}}>
              <View style={{ width:'25%', flexDirection:'column'}}>
                <Image source={car_icon_small} style={{ height:50, width:50}} />
              </View>
              <View style={{ justifyContent:'center', flexDirection:'column' }}>
                  <Text style={styles.cab_details}>{this.state.data.vehicle_type} - {this.state.data.color} {this.state.data.vehicle_name}</Text>
              </View>
            </View>
            <Divider style={styles.default_divider} />
            {this.state.data.status < 6 ?
              <View style={{flexDirection:'row', width:'100%'}}>
                <View style={{ width:'25%', flexDirection:'column'}}>
                  <Image source={meter_icon} style={{ height:50, width:50 }} />
                </View>
                <View style={{ width:'50%',justifyContent:'center', alignItems: 'flex-start', flexDirection:'column'  }}>
                  <Text style={styles.cab_details}>{global.currency}{this.state.data.total}</Text>
                </View>
                <View style={{  width:'25%',justifyContent:'center', alignItems: 'flex-start', flexDirection:'column' }}>
                  <Text style={styles.cab_details}>{this.state.data.distance} {strings.km}</Text>
                </View>
              </View>
            :
              <View style={{flexDirection:'row', width:'100%'}}>
                <View style={{ width:'25%', flexDirection:'column'}}>
                  <Image square source={meter_icon} style={{ height:50, width:50 }} />
                </View> 
                <View style={{ width:'50%',justifyContent:'center', alignItems: 'flex-start', flexDirection:'column'  }}>
                  <Text style={styles.cab_details}>{global.currency}0</Text>
                </View>   
                <View style={{  width:'25%',justifyContent:'center', alignItems: 'flex-start', flexDirection:'column' }}>
                  <Text style={styles.cab_details}>0{strings.km}</Text>
                </View>
              </View>
            }
            {this.state.data.status != 6 &&
              <View>
                <Divider style={styles.default_divider} />
                <View style={{flexDirection:'row', width:'100%'}}>
                  <View style={{ width:'20%', justifyContent:'center', flexDirection:'column'}}>
                    <Text style={styles.time}>{Moment(this.state.data.start_time).format('hh:mm A')}</Text>
                  </View>
                  <View style={{ justifyContent:'center', padding: 10, flexDirection:'column', width:'80%', }}>
                    <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'center' }}>
                      <Badge status="success" />
                      <View style={{ marginLeft : 10}} />
                      <Text style={styles.address}>{this.state.data.pickup_address}</Text>
                    </View>
                  </View>
                </View>
                <View style={{ margin:5 }} />
                <View style={{flexDirection:'row', width:'100%'}}>
                  <View style={{ width:'20%', justifyContent:'center', flexDirection:'column'}}>
                    <Text style={styles.time}>{Moment(this.state.data.end_time).format('hh:mm A')}</Text>
                  </View>
                  <View style={{ justifyContent:'center', padding: 10, flexDirection:'column', width:'80%', }}>
                    <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'center' }}>
                      <Badge status="error" />
                      <View style={{ marginLeft : 10}} />
                      <Text style={styles.address}>{this.state.data.drop_address}</Text>
                    </View>
                  </View>
                </View>
              </View>
              }
            {this.state.data.status < 6 ?
              <View>
                <Divider style={styles.default_divider} />
                <Text style={styles.billing}>{strings.buill_details}</Text>
                <View style={{ margin:10 }} />
                <View style={{flexDirection:'row', width:'100%'}}>
                  <View style={{ width:'50%', justifyContent:'center', alignItems:'flex-start'}}>
                    <Text style={styles.trip}>{strings.fare}</Text>
                  </View>
                  <View style={{ justifyContent:'center', width:'50%', alignItems:'flex-end' }}>
                    <Text style={styles.trip_amt}>{global.currency}{this.state.data.sub_total}</Text>
                  </View>
                </View>
                <View style={{ margin:5 }} />
                <View style={{flexDirection:'row', width:'100%'}}>
                  <View style={{ width:'50%',  justifyContent:'center', alignItems:'flex-start'}}>
                    <Text style={styles.trip}>{strings.taxes}</Text>
                  </View>
                  <View style={{ justifyContent:'center', width:'50%', alignItems:'flex-end' }}>
                      <Text style={styles.trip_amt}>{global.currency}{this.state.data.tax}</Text>
                  </View>
                </View>
                <View style={{ margin:5 }} />
                <View style={{flexDirection:'row', width:'100%'}}>
                  <View style={{ width:'50%',  justifyContent:'center', alignItems:'flex-start'}}>
                    <Text style={styles.trip}>{strings.discount}</Text>
                  </View>
                  <View style={{ justifyContent:'center', width:'50%', alignItems:'flex-end' }}>
                      <Text style={styles.trip_amt}>{global.currency}{this.state.data.discount}</Text>
                  </View>
                </View>
                {this.state.data.tip !=0 &&
                  <View style={{flexDirection:'row', width:'100%', marginTop:10}}>
                    <View style={{ width:'50%',  justifyContent:'center', alignItems:'flex-start'}}>
                      <Text style={styles.tip}>{strings.tip_for_you}</Text>
                    </View>
                    <View style={{ justifyContent:'center', width:'50%', alignItems:'flex-end' }}>
                        <Text style={styles.tip_amt}>+{global.currency}{this.state.data.tip}</Text>
                    </View>
                  </View>
                }
                <View style={{ margin:10 }} />
                <View style={{flexDirection:'row', width:'100%'}}>
                  <View style={{ width:'50%',  justifyContent:'center', alignItems:'flex-start'}}>
                    <Text style={styles.bill_amt}>{strings.total_bill}</Text>
                  </View>
                  <View style={{ justifyContent:'center', width:'50%', alignItems:'flex-end' }}>
                      <Text style={styles.bill_amt}>{global.currency}{this.state.data.total}</Text>
                  </View>
                </View>
                <Divider style={styles.default_divider} />
                <Text style={styles.payment}>{strings.payment_mode}</Text>
                <View style={{ margin:10 }} />
                <View style={{flexDirection:'row', width:'100%'}}>
                  <View style={{ width:'50%',  justifyContent:'center', alignItems:'flex-start'}}>
                    <Text style={styles.cash}>{this.state.data.payment}</Text>
                  </View>
                  <View style={{ justifyContent:'center', width:'50%', alignItems:'flex-end' }}>
                      <Text style={styles.cash_amt}>{global.currency}{this.state.data.total}</Text>
                  </View>
                </View>
              </View>
              :
              <View style={{alignItems: 'center', marginTop:50, flexDirection:'column'}}>
                <Image square source={cancel} style={{ height:100, width:130 }} />
              </View>
          }
          </View>
          <View style={{ margin:30}}/>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

export default RideDetails;

const styles = StyleSheet.create({
  cab_driver:{ 
    fontSize:14, 
    fontFamily:font_title, 
    color:colors.theme_fg_two 
  },
  default_divider:{ 
    marginTop:10, 
    marginBottom:10 
  },
  cab_details:{ 
    fontSize:14, 
    fontFamily:font_title, 
    color:colors.theme_fg_four, 
    letterSpacing:0.5 ,
    alignItems: 'flex-start'
  },
  time:{ 
    fontSize:14, 
    color:colors.theme_fg_two, 
    fontFamily:font_description,
    alignItems: 'flex-start' 
  },
  address:{ fontSize:14, 
    color:colors.theme_fg_two, 
    fontFamily:font_description 
  },
  billing:{ 
    fontSize:14, 
    color:colors.theme_fg_two, 
    fontFamily:font_description 
  },
  trip:{ 
    fontSize:15, 
    color:colors.theme_fg_four, 
    fontFamily:font_description 
  },
  trip_amt:{ 
    fontSize:15, 
    color:colors.theme_fg_four, 
    fontFamily:font_description 
  },
  tip:{ 
    fontSize:15, 
    color:colors.green, 
    fontFamily:font_title 
  },
  tip_amt:{ 
    fontSize:15, 
    color:colors.green, 
    fontFamily:font_title 
  },
  bill_amt:{ 
    fontSize:14, 
    fontFamily:font_title, 
    color:colors.theme_fg_four 
  },
  payment:{ 
    fontSize:15, 
    fontFamily:font_title, 
    color:colors.theme_fg_two, 
    letterSpacing:1 
  },
  cash:{ 
    fontSize:15, 
    color:colors.theme_fg_four, 
    fontFamily:font_description
  },
  cash_amt:{ 
    fontSize:15, 
    color:colors.theme_fg_four, 
    fontFamily:font_description 
  },
  rate:{ 
    fontSize:12, 
    color:colors.theme_fg_four, 
    fontFamily:font_description 
  },

});
