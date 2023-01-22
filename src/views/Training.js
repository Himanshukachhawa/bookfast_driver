import React, {Component} from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, SafeAreaView, ScrollView  } from 'react-native';
import * as colors from '../assets/css/Colors';
import axios from 'axios';
import { api_url, driver_tutorials, img_url, font_title, font_description  } from '../config/Constants';
import Loader from '../components/Loader';
import strings from "../languages/strings.js";

export default class Training extends Component {
  constructor(props) {
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      data:[],
      isLoading:false
    }
    this.get_tutorials();
      
  }

  handleBackButtonClick = () => {
    this.props.navigation.goBack(null);
  };
  
  get_tutorials = async () => {
    this.setState({ isLoading: true });
    await axios({
      method: 'post', 
      url: api_url + driver_tutorials,
      data: {country_id :  global.country_id, lang: global.lang}
    })
    .then(async response => {
      this.setState({ isLoading: false });
      this.setState({ data : response.data.result });
    })
    .catch(error => {
      this.setState({ isLoading: false });
      alert(strings.sorry_something_went_wrong);
    });
  }

  training_details = (data) =>{
    this.props.navigation.navigate('TrainingDetails',{ data : data});
  }

  render() {
    return (
      <SafeAreaView style={{ backgroundColor:colors.theme_bg_three, flex:1}}>
        <Loader visible={this.state.isLoading} />
        <ScrollView style={{padding:20}}>
          <FlatList data={this.state.data} 
            renderItem={({item, index}) =>
              <View style={{ width:'50%' }}>
                <TouchableOpacity style={{ alignItems:'center' }} activeOpacity={1} onPress={() => this.training_details(item)} >
                  <Image  style={{width:150, height: 150, borderRadius:10 }} source={{ uri : img_url + item.thumbnail_image }} />
                  <View style={{ margin: 5}} />
                  <Text style={{color:colors.theme_fg_two ,fontSize:14, fontFamily:font_description}} >{item.title}</Text>
                </TouchableOpacity>
              </View>
            }
            numColumns={2} 
          />
          <View style={{ alignItems:'center',marginTop:'60%'}}>
            {this.state.data.length == 0 && 
              <Text style={{ fontSize:16, fontFamily:font_title, color:colors.theme_fg_two, textAlign:'justify'}}>{strings.training_list_is_empty}</Text>
            }
          </View> 
        </ScrollView>
      </SafeAreaView>
    
    );
  }
}  

const styles = StyleSheet.create({

});


