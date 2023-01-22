import React, {Component} from 'react';
import { StyleSheet, Text, View,  FlatList, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native';
import * as colors from '../assets/css/Colors';
import { bell_icon, font_title, font_description, api_url, get_notification_messages  } from '../config/Constants';
import axios from 'axios';
import { connect } from 'react-redux';
import { serviceActionPending, serviceActionError, serviceActionSuccess } from '../actions/NotificationActions';
import strings from "../languages/strings.js";
import { Divider } from 'react-native-elements';
import Moment from 'moment';
import Loader from '../components/Loader';

class Notification extends Component<Props> {
 constructor(props) {
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state={
      isLoading:false
    }
  }

  handleBackButtonClick= () => {
    this.props.navigation.goBack(null);
  }

  async componentDidMount(){
    this._unsubscribe=this.props.navigation.addListener('focus',async ()=>{
      await this.notification();
    });
  }

  componentWillUnmount(){
    this._unsubscribe();
  }

  show_alert(message){
    this.dropDownAlertRef.alertWithType('error', strings.error,message);
  }

  notification_details(item){
    this.props.navigation.navigate('NotificationDetails',{data:item});
  }

  notification = async () => {
    this.props.serviceActionPending();
    await axios({
      method: 'post', 
      url: api_url + get_notification_messages,
      data: {country_id :  global.country_id, driver_id : global.id, lang:global.lang}
    })
    .then(async response => {
        await this.props.serviceActionSuccess(response.data)
    })
    .catch(error => {
        this.props.serviceActionError(error);
    });
  }


  render() {
    const { isLoding, error, data, message, status } = this.props
    return (
      <SafeAreaView style={{ backgroundColor:colors.theme_bg_three, flex:1}}>
        <Loader visible={isLoding}/>
        <ScrollView style={{padding:20}}>
          <FlatList
            data={data}
              renderItem={({ item,index }) => (
                <TouchableOpacity onPress={this.notification_details.bind(this,item)}>
                  <View style={{ flexDirection:'row', width:'100%' }}>
                    <View style={{ width:'20%' }}>
                      <Image square style={{ height:40, width:40 }} source={bell_icon} />
                    </View>
                    <View style={{ width:'80%' }}>
                      <Text style={styles.coupon_title}>{item.title}</Text>
                      <Text style={styles.coupon_description} numberOfLines={1} ellipsizeMode='tail' >{item.message}</Text>
                      <Text style={{ color:colors.theme_fg_two, fontSize:11 }}>{Moment(item.created_at).fromNow() }</Text>
                    </View>
                  </View>
                  <Divider style={styles.default_divider} />
                </TouchableOpacity>
              )}
              keyExtractor={item => item.id}
          />
          <View style={{ alignItems:'center',marginTop:'60%'}}>
            {data.length == 0 && 
              <Text style={{ fontSize:16, fontFamily:font_title, color:colors.theme_fg_two, textAlign:'justify'}}>{strings.notification_list_is_empty}</Text>
            }
          </View> 
        </ScrollView>
      </SafeAreaView>
    );
  }
}

function mapStateToProps(state){
  return{
    isLoding : state.notification.isLoding,
    error : state.notification.error,
    data : state.notification.data,
    message : state.notification.message,
    status : state.notification.status,
  };
}

const mapDispatchToProps = (dispatch) => ({
    serviceActionPending: () => dispatch(serviceActionPending()),
    serviceActionError: (error) => dispatch(serviceActionError(error)),
    serviceActionSuccess: (data) => dispatch(serviceActionSuccess(data))
});

export default connect(mapStateToProps,mapDispatchToProps)(Notification);

const styles = StyleSheet.create({
  default_divider:{ 
    marginTop:10, 
    marginBottom:10 
  },
  description:{
    color:colors.theme_fg_four,
    fontFamily:font_description,
    fontSize:14
  },
  coupon_title:{ fontSize:14, fontFamily:font_description,color:colors.theme_fg_two },
  coupon_description:{ color:colors.theme_fg_four, fontSize:12, fontFamily:font_description },
  justnow:{ color:colors.theme_fg_four, fontSize:11, fontFamily:font_description },
});
