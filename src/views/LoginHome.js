import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  Image,
  View,
  TouchableOpacity,
  I18nManager,
  SafeAreaView,
  ScrollView,
  Linking,
} from "react-native";
import * as colors from "../assets/css/Colors";
import {
  height_60,
  app_name,
  font_title,
  height_40,
  india,
} from "../config/Constants";
import PhoneInput from "react-native-phone-input";
import { StatusBar } from "../components/GeneralComponents";
import strings from "../languages/strings.js";
import RNRestart from "react-native-restart";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import CardView from "react-native-cardview";

class LoginHome extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      language: global.lang,
    };
  }

  move_login() {
    this.props.navigation.navigate("Login");
  }

  async language_change(lang) {
    if (global.lang != lang) {
      try {
        await AsyncStorage.setItem("lang", lang);
        strings.setLanguage(lang);
        if (lang == "ar") {
          I18nManager.forceRTL(true);
          RNRestart.Restart();
        } else {
          I18nManager.forceRTL(false);
          RNRestart.Restart();
        }
      } catch (e) {}
    }
  }

  driver_registeration = () => {
    //  this.props.navigation.navigate("DriverRegisteration");
    Linking.openURL("https://forms.gle/qEA4BvvtwSJ7MYmt5 ");
  };

  render() {
    return (
      <SafeAreaView>
        <View>
          <StatusBar />
        </View>
        <ScrollView style={{ backgroundColor: colors.theme_fg_three }}>
          <View style={styles.image_container}>
            <Image
              style={styles.image}
              source={require(".././assets/img/driver_logo.jpg")}
              resizeMode={"contain"}
            />
          </View>
          <View style={styles.padding_20}>
            <Text style={styles.title}>
              {strings.your_bookings_from} {app_name}
            </Text>
            <View style={styles.margin_20} />
            {/*<TouchableOpacity onPress={this.move_login.bind(this)} activeOpacity={1}>
              <PhoneInput style={{ borderColor:colors.theme_fg_two }} flagStyle={styles.flag_style} disabled={true} initialCountry="lb" offset={10} textStyle={styles.country_text} value={strings.phone_number} />
            </TouchableOpacity>*/}
            <TouchableOpacity
              onPress={this.move_login.bind(this)}
              activeOpacity={1}
            >
              <View
                style={{
                  flexDirection: "row",
                  borderBottomWidth: 1,
                  padding: 5,
                  width: "100%",
                  borderBottomColor: colors.theme_fg_two,
                }}
              >
                <Image style={styles.flag_style} source={india} />
                <Text
                  style={{
                    color: colors.theme_fg_two,
                    marginLeft: 10,
                    fontSize: 16,
                  }}
                >
                  {strings.enter_your_mobile_number}
                </Text>
              </View>
            </TouchableOpacity>
            <View style={{ margin: 10 }} />
            <View style={{ marginTop: 20, margin: 20 }} />
            {global.language_status != 1 && (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <CardView
                  cardElevation={2}
                  cardMaxElevation={5}
                  style={{
                    width: 140,
                    height: 40,
                    borderRadius: 10,
                    justifyContent: "center",
                    backgroundColor: colors.theme_fg_three,
                  }}
                  cornerRadius={10}
                >
                  <Picker
                    selectedValue={this.state.language}
                    style={{ color: colors.theme_fg, width: 140 }}
                    itemStyle={{ fontFamily: font_title }}
                    onValueChange={(itemValue, itemIndex) =>
                      this.language_change(itemValue)
                    }
                  >
                    <Picker.Item label={strings.english} value="en" />
                    <Picker.Item label={strings.arabic} value="ar" />
                  </Picker>
                </CardView>
              </View>
            )}

            <Text
              style={{
                color: colors.theme_fg_two,
                fontFamily: font_title,
                letterSpacing: 2,
                color: colors.theme_fg_two,
                fontFamily: font_title,
                fontSize: 20,
                alignSelf: "center",
                marginTop: 30,
              }}
              onPress={this.driver_registeration}
            >
              Add Registration
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

export default LoginHome;

const styles = StyleSheet.create({
  image_container: {
    height: height_60,
    width: "100%",
  },
  image: {
    flex: 1,
    width: undefined,
    height: undefined,
    backgroundColor: colors.theme_fg_three,
  },
  padding_20: {
    padding: 20,
    height: height_40,
  },
  title: {
    fontSize: 20,
    fontFamily: font_title,
    letterSpacing: 2,
    color: colors.theme_fg_two,
    fontFamily: font_title,
  },
  margin_20: {
    margin: 20,
  },
  flag_style: {
    width: 38,
    height: 24,
  },
  country_text: {
    fontSize: 18,
    borderBottomWidth: 1,
    paddingBottom: 8,
    height: 35,
    color: colors.theme_fg_two,
  },
});
