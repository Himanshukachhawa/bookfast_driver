import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import * as colors from "../assets/css/Colors";
import {
  stripe_payment,
  alert_close_timing,
  api_url,
  add_wallet,
  wallet,
  wallet_icon,
  font_title,
  font_description,
  wallet_payment_methods,
  img_url,
} from "../config/Constants";
import DropdownAlert from "react-native-dropdownalert";
import { Button } from "react-native-elements";
import DialogInput from "react-native-dialog-input";
import axios from "axios";
import { connect } from "react-redux";
import {
  addWalletPending,
  addWalletError,
  addWalletSuccess,
  walletPending,
  walletError,
  walletSuccess,
} from "../actions/WalletActions";
import Loader from "../components/Loader";
import RBSheet from "react-native-raw-bottom-sheet";
import RazorpayCheckout from "react-native-razorpay";
import stripe from "tipsi-stripe";
import Moment from "moment";
import strings from "../languages/strings.js";
//import RNPaystack from 'react-native-paystack';
import { PayWithFlutterwave } from "flutterwave-react-native";
import { CreditCardInput } from "react-native-credit-card-input";
import CardView from "react-native-cardview";

class Incentive extends Component<Props> {
  constructor(props) {
    super(props);
    this.drawer = this.drawer.bind(this);
    this.open_dialog = this.open_dialog.bind(this);
    this.get_wallet = this.get_wallet.bind(this);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      isDialogVisible: false,
      wallet_amount: 0,
      wallet_history: "",
      payment_methods: [],
      amount: 0,
      isLoading: false,
      access_code: "",
      open_flutterwave: 0,
      exp_month: "",
      exp_month: "",
      number: "",
      cvc: "",
      validation: false,
      res: "",
      open_paystack: 0,
    };
    this.get_payment_methods();
  }

  async componentDidMount() {
    await this.get_wallet();
  }

  handleBackButtonClick = () => {
    this.props.navigation.goBack(null);
  };

  drawer = () => {
    this.props.navigation.toggleDrawer();
  };

  open_dialog() {
    this.setState({ isDialogVisible: true });
  }

  onChange = async (form) => {
    console.log(form.valid);
    this.setState({ validation: form.valid });
    if (form.valid) {
      let expiry = await form.values.expiry;
      let res = await expiry.split("/");
      await this.setState({
        number: form.values.number,
        exp_month: res[0],
        exp_year: res[1],
        cvc: form.values.cvc,
      });
      await this.paystack();
    }
  };

  get_paystack_accesstoken = async () => {
    this.setState({ isLoading: true });
    await axios({
      method: "post",
      url: "https://api.paystack.co/transaction/initialize",
      headers: { Authorization: "Bearer " + global.paystack_secret_key },
      data: { email: global.email, amount: this.state.amount * 100 },
    })
      .then(async (response) => {
        this.setState({ isLoading: false });
        this.setState({ access_code: response.data.data.access_code });
      })
      .catch((error) => {
        this.setState({ isLoading: false });
        alert(strings.sorry_something_went_wrong);
      });
  };

  paystack = async () => {
    await RNPaystack.init({ publicKey: global.paystack_public_key });
    await this.get_paystack_accesstoken();
    await this.setState({ isLoading: true });
    await RNPaystack.chargeCardWithAccessCode({
      cardNumber: this.state.number,
      expiryMonth: this.state.exp_month,
      expiryYear: this.state.exp_year,
      cvc: this.state.cvc,
      accessCode: this.state.access_code,
    })
      .then((response) => {
        this.setState({ isLoading: false, open_paystack: 0 });
        if (response.reference) {
          this.add_wallet();
        } else {
          alert(strings.sorry_something_went_wrong);
        }
      })
      .catch((error) => {
        this.setState({ isLoading: false, open_paystack: 0 });
        alert(strings.sorry_something_went_wrong);
      });
  };

  get_wallet = async () => {
    this.setState({ isLoading: true });
    await axios({
      method: "post",
      url: api_url + wallet,
      data: { id: global.id, lang: global.lang, type: "9" },
    })
      .then(async (response) => {
        this.setState({ isLoading: false });
        console.log("response", response.data.result.wallet_amount);
        await this.setState({
          wallet_amount: response.data.result.wallet_amount,
          wallet_history: response.data.result.wallets,
        });
        global.wallet = response.data.result.wallet_amount;
      })
      .catch((error) => {
        this.setState({ isLoading: false });
        alert(strings.sorry_something_went_wrong);
      });
  };

  add_wallet = async () => {
    this.props.addWalletPending();
    await axios({
      method: "post",
      url: api_url + add_wallet,
      data: {
        id: global.id,
        country_id: global.country_id,
        amount: this.state.amount,
      },
    })
      .then(async (response) => {
        await this.props.addWalletSuccess(response.data);
        await this.get_wallet();
      })
      .catch((error) => {
        alert(strings.sorry_something_went_wrong);
        this.props.addWalletError(error);
      });
  };

  show_alert(message) {
    this.dropDownAlertRef.alertWithType("error", strings.error, message);
  }

  choose_payment = (total_fare) => {
    if (!isNaN(total_fare) && total_fare > 0) {
      this.setState({ isDialogVisible: false, amount: total_fare });
      this.select_payment();
      // this.RBSheet.open();
    } else {
      this.setState({ isDialogVisible: false });
      alert("Please enter valid amount");
    }
    //this.razorpay(total_fare);
  };

  get_payment_methods = async () => {
    await axios({
      method: "post",
      url: api_url + wallet_payment_methods,
      data: { country_id: global.country_id, lang: global.lang },
    })
      .then(async (response) => {
        //alert(JSON.stringify(response));
        this.setState({ payment_methods: response.data.result });
      })
      .catch((error) => {
        alert(strings.sorry_something_went_wrong);
      });
  };

  select_payment = (item) => {
    this.payment_done(5);
    this.RBSheet.close();
  };

  payment_done = async (payment_type) => {
    if (payment_type != 0) {
      if (payment_type == 4) {
        await this.stripe_card();
      } else if (payment_type == 5) {
        await this.razorpay();
      }
      if (payment_type == 7) {
        this.setState({ open_paystack: 1 });
      } else {
        this.setState({ open_paystack: 0 });
      }

      if (payment_type == 8) {
        this.setState({ open_flutterwave: 1 });
      } else {
        this.setState({ open_flutterwave: 0 });
      }
    } else {
      alert(strings.please_select_payment_method);
    }
  };

  razorpay = async () => {
    var options = {
      currency: global.currency_short_code,
      key: global.razorpay_key,
      amount: this.state.amount * 100,
      name: "Bookfast",
      prefill: {
        email: global.email,
        contact: global.phone_with_code,
        name: global.first_name,
      },
      theme: { color: colors.theme_fg },
    };
    RazorpayCheckout.open(options)
      .then((data) => {
        this.add_wallet();
      })
      .catch((error) => {
        alert("Transaction declined");
      });
  };

  stripe_card = async () => {
    stripe.setOptions({
      publishableKey: global.stripe_key,
      merchantId: "MERCHANT_ID", // Optional
      androidPayMode: "test", // Android only
    });
    const response = await stripe.paymentRequestWithCardForm({
      requiredBillingAddressFields: "full",
      prefilledInformation: {
        billingAddress: {
          name: global.first_name,
        },
      },
    });

    if (response.tokenId) {
      this.stripe_payment(response.tokenId);
    } else {
      //alert(strings.sorry_something_went_wrong);
    }
  };

  stripe_payment = async (token) => {
    this.setState({ isLoading: true });
    await axios({
      method: "post",
      url: api_url + stripe_payment,
      data: { customer_id: global.id, amount: this.state.amount, token: token },
    })
      .then(async (response) => {
        this.setState({ isLoading: false });
        this.add_wallet();
      })
      .catch((error) => {
        alert("Transaction Declined");
        this.setState({ isLoading: false });
      });
  };

  handleOnRedirect = (data) => {
    this.setState({ open_flutterwave: 0 });
    if (data.status == "successful") {
      this.add_wallet();
    } else {
      alert("Sorry, your payment declined");
    }
  };

  close_flutterwave = () => {
    this.setState({ open_flutterwave: 0, open_paystack: 0 });
  };

  render() {
    const { isLoding, error, data, message, status } = this.props;

    return (
      <SafeAreaView>
        <ScrollView style={{ padding: 10 }}>
          <Loader visible={this.state.isLoading} />
          <CardView
            style={{
              borderRadius: 10,
              backgroundColor: colors.theme_bg_three,
              flexDirection: "row",
              width: "100%",
              padding: 20,
            }}
            cardElevation={2}
            cardMaxElevation={5}
            cornerRadius={10}
          >
            <View
              style={{
                width: "20%",
                alignItems: "flex-start",
                justifyContent: "center",
              }}
            >
              <Image
                square
                source={wallet_icon}
                style={{ height: 35, width: 35, tintColor: colors?.theme_bg }}
              />
            </View>
            <View
              style={{
                width: "40%",
                alignItems: "flex-start",
                justifyContent: "center",
              }}
            >
              <Text style={styles.bal_amt}>
                {global.currency} {this.state.wallet_amount}
              </Text>
              <Text style={styles.bal}>{strings.your_balance}</Text>
            </View>

            {/* <View
              style={{
                width: "40%",
                alignItems: "flex-end",
                justifyContent: "center",
              }}
            >
              <Button
                title={strings.add_money}
                onPress={this.open_dialog}
                type="outline"
                buttonStyle={{ borderColor: colors.theme_fg_two }}
                titleStyle={{ color: colors.theme_fg_two }}
              />
            </View> */}
          </CardView>
          <View style={styles.margin_10} />
          <Text style={styles.wal_trans}>Transactions</Text>
          <FlatList
            data={this.state.wallet_history}
            renderItem={({ item, index }) => (
              <View
                style={{
                  flexDirection: "row",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  borderBottomWidth: 0.3,
                  borderColor: colors.theme_fg_four,
                  padding: 10,
                }}
              >
                <View
                  style={{
                    width: "20%",
                    alignItems: "flex-start",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    square
                    source={wallet_icon}
                    style={{
                      height: 35,
                      width: 35,
                      tintColor: colors?.theme_bg,
                    }}
                  />
                </View>
                <View
                  style={{
                    width: "50%",
                    alignItems: "flex-start",
                    justifyContent: "center",
                  }}
                >
                  {console.log("ti", item)}
                  <Text style={styles.paid_wal}>{item.message}</Text>
                  <Text style={styles.date_time}>
                    {Moment(item.created_at).format("MMM DD, YYYY hh:mm A")}
                  </Text>
                </View>
                <View
                  style={{
                    width: "30%",
                    alignItems: "flex-end",
                    justifyContent: "center",
                  }}
                >
                  <Text style={styles.amt}>
                    {global.currency} {item.amount}
                  </Text>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.id}
          />
          <View style={{ margin: 10 }} />
          {this.state.open_flutterwave == 1 && (
            <View>
              <PayWithFlutterwave
                onRedirect={this.handleOnRedirect}
                options={{
                  tx_ref: Date.now() + "-" + global.id,
                  authorization: global.flutterwave_public_key,
                  customer: {
                    email: global.email,
                  },
                  amount: this.state.amount,
                  currency: "NGN",
                  payment_options: "card",
                }}
              />
              <View style={{ margin: 10 }} />
              <Text
                style={{
                  fontFamily: font_description,
                  color: colors.theme_fg_two,
                  alignSelf: "center",
                  fontSize: 16,
                }}
                onPress={this.close_flutterwave.bind(this)}
              >
                Cancel
              </Text>
            </View>
          )}
          {this.state.open_paystack == 1 && (
            <View>
              <CreditCardInput
                onChange={this.onChange}
                labelStyle={{ color: colors.theme_fg }}
                inputStyle={{ color: colors.theme_fg }}
                validColor={{ color: colors.theme_fg }}
                placeholderColor={colors.theme_fg_three}
                additionalInputsProps={colors.theme_fg}
              />
              <View style={{ margin: 10 }} />
              <Text
                style={{
                  fontFamily: font_description,
                  color: colors.theme_fg_two,
                  alignSelf: "center",
                  fontSize: 16,
                }}
                onPress={this.close_flutterwave.bind(this)}
              >
                Cancel
              </Text>
            </View>
          )}
        </ScrollView>
        <RBSheet
          ref={(ref) => {
            this.RBSheet = ref;
          }}
          height={250}
          animationType="fade"
          duration={250}
        >
          <View style={{ flexDirection: "row" }}>
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Text style={styles.payment_option}>
                {strings.select_a_payment_option}
              </Text>
            </View>
          </View>
          <FlatList
            data={this.state.payment_methods}
            renderItem={({ item, index }) =>
              item.payment_type != 1 && (
                <TouchableOpacity
                  onPress={this.select_payment.bind(this, item)}
                >
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
                        width: "40%",
                        alignItems: "flex-start",
                        justifyContent: "center",
                      }}
                    >
                      <Image
                        style={{ flex: 1, height: 50, width: 100 }}
                        source={{ uri: img_url + item.icon }}
                      />
                    </View>
                    <View
                      style={{
                        width: "60%",
                        alignItems: "flex-start",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: font_description,
                          color: colors.theme_fg_four,
                          fontSize: 14,
                        }}
                      >
                        {item.payment}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )
            }
            keyExtractor={(item) => item.id}
          />
        </RBSheet>
        <DialogInput
          isDialogVisible={this.state.isDialogVisible}
          title={strings.add_wallet}
          message={strings.please_enter_your_amount_here}
          hintInput={strings.enter_amount}
          textInputProps={{ keyboardType: "numeric" }}
          submitInput={(inputText) => {
            this.choose_payment(inputText);
          }}
          closeDialog={() => {
            this.setState({ isDialogVisible: false });
          }}
        >
          submitText={strings.submit}
          cancelText={strings.cancel}
        </DialogInput>
        <DropdownAlert
          ref={(ref) => (this.dropDownAlertRef = ref)}
          closeInterval={alert_close_timing}
        />
      </SafeAreaView>
    );
  }
}

function mapStateToProps(state) {
  return {
    isLoding: state.wallet.isLoding,
    message: state.wallet.message,
    status: state.wallet.status,
    data: state.wallet.data,
  };
}

const mapDispatchToProps = (dispatch) => ({
  addWalletPending: () => dispatch(addWalletPending()),
  addWalletError: (error) => dispatch(addWalletError(error)),
  addWalletSuccess: (data) => dispatch(addWalletSuccess(data)),
  walletPending: () => dispatch(walletPending()),
  walletError: (error) => dispatch(walletError(error)),
  walletSuccess: (data) => dispatch(walletSuccess(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Incentive);

const styles = StyleSheet.create({
  bal_amt: {
    fontFamily: font_title,
    fontSize: 18,
    color: colors.theme_fg,
  },
  bal: {
    fontSize: 13,
    color: colors.theme_fg_four,
    fontFamily: font_description,
  },
  margin_10: {
    margin: 10,
  },
  wal_trans: {
    fontSize: 16,
    fontFamily: font_title,
    color: colors.theme_fg_two,
  },
  paid_wal: {
    fontSize: 14,
    fontFamily: font_title,
    color: colors.theme_fg_two,
  },
  date_time: {
    fontSize: 12,
    color: colors.theme_fg_two,
    fontFamily: font_description,
    alignItems: "flex-start",
  },
  amt: {
    fontSize: 16,
    fontFamily: font_title,
    color: colors.theme_fg_two,
  },
});
