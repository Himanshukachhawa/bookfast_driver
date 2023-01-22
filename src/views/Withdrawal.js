import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import * as colors from "../assets/css/Colors";
import Loader from "../components/Loader";
import {
  api_url,
  debited_icon,
  withdrawal_history,
  withdrawal_request,
  font_title,
  font_description,
} from "../config/Constants";
import axios from "axios";
import strings from "../languages/strings.js";
let moment = require("moment");
import DialogInput from "react-native-dialog-input";
import CardView from "react-native-cardview";

class Withdrawal extends Component<Props> {
  constructor(props) {
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      IsDialogVisible: false,
      isLoading: false,
      wallet_amount: "",
      withdraw: [],
      dialog_status: false,
      limit: 0,
    };
    this.withdrawal();
  }

  handleBackButtonClick = () => {
    this.props.navigation.goBack(null);
  };

  withdraw = () => {
    if (this.state.wallet_amount > 0) {
      this.setState({ dialog_status: true });
    } else {
      alert(strings.your_balance_is_low);
    }
  };

  showDialog = (val) => {
    this.setState({ dialog_status: false });
  };

  sendInput(val) {
    this.setState({ dialog_status: false });
    if (isNaN(val)) {
      alert("Please enter valid amount");
    } else if (val > this.state.wallet_amount) {
      alert("Your maximum wallet balance is " + this.state.wallet_amount);
    } else {
      this.withdrawalrequest(val);
    }
  }

  withdrawal = async () => {
    this.setState({ isLoading: true });
    await axios({
      method: "post",
      url: api_url + withdrawal_history,
      data: { id: global.id, lang: global.lang },
    })
      .then(async (response) => {
        this.setState({
          isLoading: false,
          wallet_amount: response.data.result.wallet_amount,
          withdraw: response.data.result.withdraw,
        });
      })
      .catch((error) => {
        this.setState({ isLoading: false });
        alert(strings.sorry_something_went_wrong);
      });
  };

  withdrawalrequest = async (val) => {
    this.setState({ isLoading: true });
    await axios({
      method: "post",
      url: api_url + withdrawal_request,
      data: { driver_id: global.id, amount: val },
    })
      .then(async (response) => {
        this.setState({ isLoading: false });
        if (response.data.status == 0) {
          alert(response.data.message);
        } else {
          this.withdrawal();
        }
      })
      .catch((error) => {
        this.setState({ isLoading: false });
        alert(strings.sorry_something_went_wrong);
      });
  };
  render() {
    return (
      <SafeAreaView style={{ backgroundColor: colors.theme_bg_three, flex: 1 }}>
        <ScrollView>
          <Loader visible={this.state.isLoading} />
          <CardView
            style={{
              margin: 10,
              backgroundColor: colors.theme_bg_three,
            }}
            cardElevation={5}
            cardMaxElevation={5}
            cornerRadius={10}
          >
            <View style={{ flexDirection: "row", padding: 20 }}>
              <View style={{ width: "30%", flexDirection: "column" }}>
                <Image
                  style={{ height: 60, width: 60, tintColor: colors?.theme_bg }}
                  source={debited_icon}
                />
              </View>
              <View style={{ flexDirection: "column" }}>
                <Text
                  style={{
                    color: colors.theme_fg_two,
                    fontFamily: font_description,
                    fontSize: 14,
                  }}
                >
                  {strings.your_balance}
                </Text>
                <Text
                  style={{
                    fontSize: 25,
                    fontFamily: font_description,
                    color: colors.theme_fg_two,
                  }}
                >
                  {global.currency}
                  {this.state.wallet_amount}
                </Text>
              </View>
            </View>
          </CardView>
          <View style={{ margin: 10 }} />
          <CardView
            style={{
              margin: 10,
              backgroundColor: colors.theme_bg_three,
            }}
            cardElevation={5}
            cardMaxElevation={5}
            cornerRadius={10}
          >
            <Text
              style={{
                padding: 5,
                paddingLeft: 20,
                paddingTop: 20,
                fontSize: 16,
                color: colors.theme_fg_two,
                fontFamily: font_description,
              }}
            >
              {strings.withdrawal_histories}
            </Text>
            <View style={{ margin: 5 }} />

            <FlatList
              data={this.state.withdraw}
              renderItem={({ item, index }) => (
                <View style={{ padding: 10 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      borderLeftWidth: 5,
                      borderColor: colors.theme_bg_two,
                    }}
                  >
                    <View
                      style={{
                        paddingLeft: 5,
                        width: "70%",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: colors.theme_fg_two,
                          fontFamily: font_description,
                          fontSize: 15,
                        }}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={{
                          color: colors.theme_fg_two,
                          fontSize: 13,
                          alignItems: "flex-start",
                          fontFamily: font_description,
                        }}
                      >
                        {moment(item.created_at).format("DD-MM-YYYY hh:mm: A")}
                      </Text>
                    </View>
                    <View
                      style={{
                        padding: 5,
                        width: "30%",
                        alignItems: "flex-end",
                      }}
                    >
                      <Text
                        style={{
                          color: colors.theme_fg_two,
                          fontFamily: font_title,
                          fontSize: 16,
                        }}
                      >
                        {global.currency}
                        {item.amount}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              keyExtractor={(item) => item.id}
            />
          </CardView>
        </ScrollView>
        <DialogInput
          isDialogVisible={this.state.dialog_status}
          title={strings.verification}
          message={strings.please_enter_your_amount_here}
          hintInput={strings.enter_amount}
          textInputProps={{ keyboardType: "numeric" }}
          submitInput={(inputText) => {
            this.sendInput(inputText);
          }}
          closeDialog={() => {
            this.showDialog(false);
          }}
          submitText={strings.submit}
          cancelText={strings.cancel}
        ></DialogInput>
        <View activeOpacity={1} style={styles.footer_container}>
          <TouchableOpacity
            onPress={this.withdraw.bind(this)}
            style={styles.footer}
          >
            <View style={{ flexDirection: "row" }}>
              <View style={styles.btn_container}>
                <Text style={styles.btn_text}>{strings.withdraw}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}

export default Withdrawal;

const styles = StyleSheet.create({
  footer: {
    backgroundColor: colors.theme_bg,
    alignItems: "center",
    justifyContent: "center",
    height: 45,
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  footer_content: {
    alignItems: "center",
    justifyContent: "center",
  },
  btn_container: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  btn_text: {
    color: colors.theme_fg_three,
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 1,
    fontFamily: font_description,
  },
});
