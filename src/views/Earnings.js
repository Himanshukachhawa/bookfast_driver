import React, { Component } from 'react';
import { StyleSheet, Text,View, FlatList, SafeAreaView, ScrollView} from 'react-native';
import * as colors from '../assets/css/Colors';
import { api_url, earning, font_title, font_description } from '../config/Constants';
import Moment from 'moment';
import axios from 'axios';
import { connect } from 'react-redux'; 
import { earningsPending, earningsError, earningsSuccess } from '../actions/EarningsActions';
import strings from "../languages/strings.js";
import CardView from 'react-native-cardview';
import { Divider } from 'react-native-elements';
import Loader from '../components/Loader';

class Earnings extends Component<Props>{
  constructor(props) {
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      today_earnings : 0, 
      total_earnings:0,
      earnings:'',
      validation:true,   
      isLoading:false     
      }
  }
  
  handleBackButtonClick= () => {
    this.props.navigation.goBack(null);
  }

  show_alert(message){
    this.dropDownAlertRef.alertWithType('error', strings.error,message);
  }

  async componentDidMount(){
    this._unsubscribe=this.props.navigation.addListener('focus',async ()=>{
      await this.earnings();
    });
  }

  componentWillUnmount(){
    this._unsubscribe();
  }

  earnings = async () => {
    this.setState({ isLoading: true });
    await axios({
      method: 'post', 
      url: api_url + earning,
      data: {id :  global.id, lang: global.lang}
    })
    .then(async response => {
    this.setState({ today_earnings:response.data.result.today_earnings, total_earnings:response.data.result.total_earnings, earnings:response.data.result.earnings});
    this.setState({ isLoading: false });
    })
    .catch(error => {
    this.setState({ isLoading: false });
    });
  }

  render(){
    return(
      <SafeAreaView style={{ backgroundColor:colors.theme_bg_three, flex:1}}>
        <ScrollView style={{padding:10}}>
          <Loader visible={this.state.isLoading} />
          <CardView 
            cardElevation={5}
            style={{ margin:10 }}
            cardMaxElevation={5}
            cornerRadius={10}>
            <View style={{alignItems:'center', justifyContent:'center', padding:10, backgroundColor:colors.theme_bg_three, flexDirection:'row', width:'100%' }}>
              <View style={{ width:'50%', alignItems:'center', justifyContent:'center', flexDirection:'column'}}>
                <Text style={{color:colors.theme_fg_two,fontFamily:font_description, fontSize:14}}>
                  {strings.total_earnings}
                </Text>
                <Text style={{ fontSize:18,fontFamily:font_description,color:colors.theme_fg_two}}>
                  {global.currency}{this.state.total_earnings}
                </Text>
              </View>
              <View
                style = {{
                  height:90,
                  width: 2,
                  backgroundColor: colors.theme_fg_two
                }}
              />
              <View style={{ width:'50%', alignItems:'center', justifyContent:'center', flexDirection:'column'}}>
                <Text style={{color:colors.theme_fg_two,fontFamily:font_description, fontSize:14}}>
                  {strings.today_earnings}
                </Text>
                <Text style={{ fontSize:18,fontFamily:font_description,color:colors.theme_fg_two}}>
                  {global.currency}{this.state.today_earnings}
                </Text>
              </View>
            </View>
          </CardView>
          <View style={{ margin:10}}/>
          <CardView 
            cardElevation={5}
            cardMaxElevation={5}
            style={{ margin:10 }}
            cornerRadius={10}>
            <View style={{ bordalignItems:'flex-start', justifyContent:'center', padding:10, backgroundColor:colors.theme_bg_three, }}>
              <Text style={{ fontSize:18,color:colors.theme_fg_two, fontFamily:font_description, alignItems: 'flex-start'}}>{strings.earnings}</Text>
              <View style={{ margin:10 }} />
              <FlatList
                data={this.state.earnings}
                renderItem={({ item,index }) => (
                <View>
                  <View style={{ flexDirection:'row', width:'100%' }}>
                  <View style={{width:'70%', alignItems:'flex-start', justifyContent:'center'}}>
                      <Text style={{ fontFamily:font_title ,fontSize:14,color:colors.theme_fg_two, alignItems: 'flex-start' }}>{strings.trip_id} #{item.trip_id}</Text>
                      <Text style={{ fontSize:12, color:colors.theme_fg_four,fontFamily:font_description, alignItems: 'flex-start'}}>{Moment(item.created_at).fromNow() }</Text>
                    </View>
                    <View style={{width:'30%', alignItems:'flex-end', justifyContent:'center'}}>
                      <Text style={{ color:colors.success,fontFamily:font_title, fontSize:14,color:colors.theme_fg_two}}>{global.currency}{item.amount}</Text>
                    </View>
                  </View>
                  <Divider style={styles.default_divider} />
                </View> 
                )}
                keyExtractor={item => item.id}
              />
              {this.state.earnings.length == 0 && 
                <View style={{ alignItems:'center', justifyContent:'center', width:'100%', marginTop:'20%', marginBottom:'20%' }}>
                  <Text style={styles.amt}>{strings.earnings_list_is_empty}</Text>
                </View> 
              }  
           </View>         
          </CardView>
          <View style={{ margin:10 }} />
        </ScrollView>
      </SafeAreaView>
    )
  }
}

export default Earnings;

const styles = StyleSheet.create({
  default_divider:{ 
    marginTop:10, 
    marginBottom:10,
    width:'80%' 
  },
  amt:{ fontSize:16, fontFamily:font_title, color:colors.theme_fg_two },
});
