import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  I18nManager,
  Platform,
} from "react-native";
import * as colors from "../assets/css/Colors";
import { font_description, menus, font_title } from "../config/Constants";
import Dialog from "react-native-dialog";
import Icon, { Icons } from "../components/Icons";
import strings from "../languages/strings.js";
import { Picker } from "@react-native-picker/picker";
import CardView from "react-native-cardview";
import RNRestart from "react-native-restart";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default class More extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      dialogVisible: false,
      language: global.lang,
    };
  }

  navigate = (route) => {
    if (route == "Logout") {
      this.showDialog();
    } else if (route == "AddressList") {
      this.props.navigation.navigate(route, { from: "More" });
    } else {
      this.props.navigation.navigate(route);
    }
  };

  showDialog = () => {
    this.setState({ dialogVisible: true });
  };

  closeDialog = () => {
    this.setState({ dialogVisible: false });
  };

  handleCancel = () => {
    this.setState({ dialogVisible: false });
  };

  handleLogout = async () => {
    this.closeDialog();
    await this.props.navigation.navigate("Logout");
  };

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

  render() {
    return (
      <SafeAreaView style={{ backgroundColor: colors.theme_bg_three, flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.profile_name}>{strings.more}</Text>
        </View>

        <Dialog.Container visible={this.state.dialogVisible}>
          <Dialog.Title>{strings.confirm}</Dialog.Title>
          <Dialog.Description>
            {strings.do_you_want_to_logout}
          </Dialog.Description>
          <Dialog.Button label={strings.yes} onPress={this.handleLogout} />
          <Dialog.Button label={strings.no} onPress={this.handleCancel} />
        </Dialog.Container>
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
        {Platform.OS == "ios" && <View style={{ marginBottom: 40 }} />}
        <FlatList
          data={menus}
          style={{ marginBottom: 100 }}
          renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => this.navigate(item.route)}>
              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 0.3,
                  borderColor: colors.theme_fg_four,
                }}
              >
                <View
                  style={{
                    width: "15%",
                    alignItems: "flex-start",
                    justifyContent: "center",
                  }}
                >
                  <View style={styles.icon_button}>
                    <Icon
                      type={Icons.FontAwesome}
                      name={item.icon}
                      color={colors.theme_bg_three}
                      style={{ fontSize: 12 }}
                    />
                  </View>
                </View>
                <View
                  style={{
                    width: "85%",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    flexDirection: "row",
                  }}
                >
                  <View style={{ width: "80%", justifyContent: "center" }}>
                    <Text style={styles.menu_name}>{item.menu_name}</Text>
                  </View>
                  <View
                    style={{
                      width: "20%",
                      alignItems: "flex-end",
                      justifyContent: "center",
                    }}
                  >
                    <Icon
                      type={Icons.Feather}
                      name="arrow-right"
                      style={{ fontSize: 18, color: colors.theme_fg_two }}
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.menu_name}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.theme_bg_two,
  },
  header: {
    padding: 20,
  },
  profile_name: {
    fontSize: 16,
    color: colors.theme_fg_two,
    fontWeight: "bold",
  },
  content: {
    backgroundColor: colors.theme_bg_three,
  },
  icon_button: {
    backgroundColor: colors.theme_bg,
    width: "70%",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
  },
  menu_name: {
    fontSize: 16,
    color: colors.theme_fg_two,
    fontFamily: font_description,
  },
});
