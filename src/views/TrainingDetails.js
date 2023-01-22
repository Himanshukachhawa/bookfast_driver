import React, {Component} from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView } from 'react-native';
import * as colors from '../assets/css/Colors';
import VideoPlayer from 'react-native-video-controls';
import { img_url, font_title, font_description  } from '../config/Constants';

export default class TrainingDetails extends Component {
  videoPlayer;
  constructor(props) {
    super(props)
    this.state = {
      data:this.props.route.params.data
    }      
  }

  handleBackButtonClick= () => {
      this.props.navigation.goBack(null);
  }

  render() {
    return (
      <SafeAreaView style={{ backgroundColor:colors.theme_bg_three, flex:1}}>
        <ScrollView>
          <View style={{flexDirection:'row'}}>
            <VideoPlayer disableSeekbar disableVolume disableBack source={{ uri : img_url + this.state.data.file }} />
          </View>
          <View style={{ margin:10 }} /> 
          <View style={{flexDirection:'row'}}>
            <Text style={{ color:colors.theme_fg_two, fontSize:20, fontFamily:font_title, padding:10 }}>{this.state.data.title}</Text>
          </View>
          <View style={{flexDirection:'row'}}>
            <Text style={{ color:colors.theme_fg_two, fontFamily:font_description, padding:10, fontSize:14 }}>{this.state.data.description}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}  

const styles = StyleSheet.create({

});


