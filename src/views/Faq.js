import React, {Component} from 'react';
import { StyleSheet, Text, FlatList, SafeAreaView, ScrollView, View, TouchableOpacity } from 'react-native';
import * as colors from '../assets/css/Colors';
import { font_description, api_url, faq } from '../config/Constants';
import Icon, { Icons } from '../components/Icons';
import axios from 'axios';
import { connect } from 'react-redux'; 
import { serviceActionPending, serviceActionError, serviceActionSuccess } from '../actions/FaqActions';
import strings from "../languages/strings.js";
import Loader from '../components/Loader';

class Faq extends Component<Props> { 
  constructor(props) {
    super(props)
  }

  async componentDidMount(){
    this._unsubscribe=this.props.navigation.addListener('focus',async ()=>{
      await this.faq();
    });
  }

  handleBackButtonClick= () => {
    this.props.navigation.goBack(null);
  }

  componentWillUnmount(){
    this._unsubscribe();
  }

  show_alert(message){
    this.dropDownAlertRef.alertWithType('error', strings.error,message);
  }

  faq_details(item){
    this.props.navigation.navigate('FaqDetails',{ data: item });
  }

  faq = async () => {
    this.props.serviceActionPending();
    await axios({
      method: 'post', 
      url: api_url + faq,
      data: {country_id :  global.country_id, lang:global.lang}
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
        <Loader visible={isLoding} />
        <ScrollView>
          <FlatList
            data={data}
            renderItem={({ item,index }) => (
              <TouchableOpacity style={{ flexDirection:'row', padding:15,  borderBottomWidth:0.3, borderColor:colors.theme_fg_four, justifyContent:'center' }} onPress={() => this.faq_details(item)}>
                <View style={{ width:'70%'}}>
                  <Text style={styles.faq_title} >{item.question}</Text>
                </View>
                <TouchableOpacity style={{ alignItems:'flex-end', justifyContent:'center', width:'30%'}}>
                  <Icon type={Icons.Feather} name="arrow-right" style={{ fontSize:18, color:colors.theme_fg_two }} />
                </TouchableOpacity>
              </TouchableOpacity>
              )}
            keyExtractor={item => item.question}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }
}


function mapStateToProps(state){
  return{
    isLoding : state.faq.isLoding,
    error : state.faq.error,
    data : state.faq.data,
    message : state.faq.message,
    status : state.faq.status,
  };
}

const mapDispatchToProps = (dispatch) => ({
    serviceActionPending: () => dispatch(serviceActionPending()),
    serviceActionError: (error) => dispatch(serviceActionError(error)),
    serviceActionSuccess: (data) => dispatch(serviceActionSuccess(data))
});


export default connect(mapStateToProps,mapDispatchToProps)(Faq);

const styles = StyleSheet.create({
  faq_title:{
    color:colors.theme_fg_two,
    fontSize:15,
    fontFamily:font_description
  }
});
