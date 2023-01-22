import React, {Component} from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView } from 'react-native';
import * as colors from '../assets/css/Colors';
import { font_title, font_description } from '../config/Constants';

class FaqDetails extends Component<Props> {
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
   render() {
    return (
      <SafeAreaView style={{ backgroundColor:colors.theme_bg_three, flex:1 }}>
        <ScrollView style={{padding:20}}>
          <Text style={styles.faq_title}>{this.state.data.question}</Text>
          <View style={styles.margin_10} />
          <Text style={{ color:colors.theme_fg_four, fontFamily:font_description, fontSize:14 }}>{this.state.data.answer}</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

export default FaqDetails;

const styles = StyleSheet.create({
  margin_10:{
    margin:10
  },
  faq_title:{
    color:colors.theme_fg_two,
    fontSize:20,
    fontFamily:font_title,
  },
});
