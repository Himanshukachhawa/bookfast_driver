import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  Image,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import * as colors from "../assets/css/Colors";
import {
  alert_close_timing,
  font_title,
  font_description,
  api_url,
  profile,
  profile_picture_path,
  profile_picture_update,
  img_url,
} from "../config/Constants";
import DropdownAlert from "react-native-dropdownalert";
import { Divider } from "react-native-elements";
import axios from "axios";
import { connect } from "react-redux";
import {
  profilePending,
  profileError,
  profileSuccess,
  updateProfilePicture,
} from "../actions/ProfileActions";
import Loader from "../components/Loader";
import strings from "../languages/strings.js";
import * as ImagePicker from "react-native-image-picker";
import RNFetchBlob from "rn-fetch-blob";
import ImgToBase64 from "react-native-image-base64";

//Image upload options
const options = {
  title: "Select a photo",
  takePhotoButtonTitle: "Take a photo",
  chooseFromLibraryButtonTitle: "Choose from gallery",
  base64: true,
  quality: 1,
  maxWidth: 500,
  maxHeight: 500,
};

class Profile extends Component<Props> {
  constructor(props) {
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      profile_picture: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      email: "",
      password: "",
      validation: true,
      data: "",
      data_img: "",
      isLoading: false,
      profile_timer: true,
      img_data: "",
      profile_image: "",
    };
  }

  async componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener("focus", async () => {
      await this.get_profile();
    });
  }

  handleBackButtonClick = () => {
    this.props.navigation.goBack(null);
  };

  componentWillUnmount() {
    this._unsubscribe();
  }

  get_profile = async () => {
    this.setState({ isLoading: true });
    this.props.profilePending();
    await axios({
      method: "post",
      url: api_url + profile,
      data: { driver_id: global.id },
    })
      .then(async (response) => {
        this.setState({ isLoading: false });
        await this.props.profileSuccess(response.data);
        this.setState({
          first_name: this.props.data.first_name,
          last_name: this.props.data.last_name,
          email: this.props.data.email,
          phone_number: this.props.data.phone_with_code,
          profile_picture: this.props.data.profile_picture,
        });
      })
      .catch((error) => {
        this.setState({ isLoading: false });
        alert(strings.sorry_something_went_wrong);
        this.props.profileError(error);
      });
  };

  select_photo = async () => {
    if (this.state.profile_timer) {
      ImagePicker.launchImageLibrary(options, async (response) => {
        if (response.didCancel) {
          console.log("User cancelled image picker");
        } else if (response.error) {
          console.log("ImagePicker Error: ", response.error);
        } else {
          const source = response.assets[0].uri;
          this.setState({ img_data: response.data });
          await ImgToBase64.getBase64String(response.assets[0].uri)
            .then(async (base64String) => {
              await this.profile_image_upload(base64String);
              this.setState({ profile_image: response.assets[0].uri });
            })
            .catch((err) => console.log(err));
        }
      });
    } else {
      alert("Please try after 20 seconds");
    }
  };

  profile_image_upload = async (data_img) => {
    this.setState({ isLoading: true });
    RNFetchBlob.fetch(
      "POST",
      api_url + profile_picture_path,
      {
        "Content-Type": "multipart/form-data",
      },
      [
        {
          name: "image",
          filename: "image.png",
          data: data_img,
        },
        {
          name: "driver_id",
          data: global.id.toString(),
        },
      ]
    )
      .then(async (resp) => {
        this.setState({ isLoading: false });
        let data = await JSON.parse(resp.data);
        console.log(data);
        if (data.result) {
          await this.profile_image_update(data.result);
        }
      })
      .catch((err) => {
        this.setState({ isLoading: false });
        console.log(err);
        alert("Error on while upload try again later.");
      });
  };

  profile_image_update = async (data) => {
    this.setState({ isLoading: true });
    await axios({
      method: "post",
      url: api_url + profile_picture_update,
      data: { id: global.id, profile_picture: data },
    })
      .then(async (response) => {
        this.setState({ isLoading: false });
        if (response.data.status == 1) {
          alert("Update Successfully");
          this.get_profile();
          this.setState({ profile_timer: false });
          setTimeout(() => {
            this.setState({ profile_timer: false });
          }, 20000);
        } else {
          alert(response.data.message);
        }
      })
      .catch((error) => {
        this.setState({ isLoading: false });
        alert("Sorry something went wrong");
      });
  };

  show_alert(message) {
    this.dropDownAlertRef.alertWithType("error", strings.error, message);
  }

  edit_first_name(id) {
    this.props.navigation.navigate("EditFirstName", {
      first_name: this.props.data.first_name,
    });
  }

  edit_last_name(id) {
    console.log(this.props.last_name);
    this.props.navigation.navigate("EditLastName", {
      last_name: this.props.data.last_name,
    });
  }

  edit_phone_number(id) {
    this.props.navigation.navigate("EditPhoneNumber", {
      phone_number: this.props.data.phone_number,
    });
  }

  edit_email(id) {
    this.props.navigation.navigate("EditEmail", {
      email: this.props.data.email,
    });
  }

  edit_password(id) {
    this.props.navigation.navigate("EditPassword", {
      password: this.props.data.password,
    });
  }

  render() {
    const { isLoding, error, data, profile_picture, message, status } =
      this.props;
    return (
      <SafeAreaView style={{ backgroundColor: colors.theme_bg_three, flex: 1 }}>
        <Loader visible={this.state.isLoading} />
        <ScrollView style={{ padding: 10 }}>
          <View style={{ margin: 10 }} />
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <TouchableOpacity onPress={this.select_photo.bind(this)}>
              <View style={styles.profile}>
                <Image
                  style={{
                    flex: 1,
                    width: undefined,
                    height: undefined,
                    borderRadius: 50,
                  }}
                  source={{ uri: img_url + this.state.profile_picture }}
                />
              </View>
              <View style={{ margin: 10 }} />
            </TouchableOpacity>
          </View>
          <View style={{ margin: 10 }} />
          <Divider style={styles.default_divider} />
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={this.edit_first_name.bind(this, 1)}
              activeOpacity={1}
              style={{ flexDirection: "column" }}
            >
              <Text style={styles.label}>{strings.first_name}</Text>
              <View style={{ margin: 3 }} />
              <Text style={styles.value}>{this.state.first_name}</Text>
            </TouchableOpacity>
          </View>
          <Divider style={styles.default_divider} />
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={this.edit_last_name.bind(this, 1)}
              activeOpacity={1}
              style={{ flexDirection: "column" }}
            >
              <Text style={styles.label}>{strings.last_name}</Text>
              <View style={{ margin: 3 }} />
              <Text style={styles.value}>{this.state.last_name}</Text>
            </TouchableOpacity>
          </View>
          <Divider style={styles.default_divider} />
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={this.edit_phone_number.bind(this, 1)}
              activeOpacity={1}
              style={{ flexDirection: "column" }}
            >
              <Text style={styles.label}>{strings.phone_number}</Text>
              <View style={{ margin: 3 }} />
              <Text style={styles.value}>{this.state.phone_number}</Text>
            </TouchableOpacity>
          </View>
          <Divider style={styles.default_divider} />
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={this.edit_email.bind(this, 1)}
              activeOpacity={1}
              style={{ flexDirection: "column" }}
            >
              <Text style={styles.label}>{strings.email}</Text>
              <View style={{ margin: 3 }} />
              <Text style={styles.value}>{this.state.email}</Text>
            </TouchableOpacity>
          </View>
          <Divider style={styles.default_divider} />
          {/* <View style={{flexDirection:'row'}}>
            <TouchableOpacity onPress={this.edit_password.bind(this,1)} activeOpacity={1} style={{flexDirection:'column'}}>
              <Text style={styles.label}>{strings.password}</Text>
              <View style={{ margin:3 }} />
              <Text style={styles.value}>******</Text>
            </TouchableOpacity>
          </View>
          <Divider style={styles.default_divider} /> */}
        </ScrollView>
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
    isLoding: state.profile.isLoding,
    message: state.profile.message,
    status: state.profile.status,
    data: state.profile.data,
    profile_picture: state.profile.profile_picture,
  };
}

const mapDispatchToProps = (dispatch) => ({
  profilePending: () => dispatch(profilePending()),
  profileError: (error) => dispatch(profileError(error)),
  profileSuccess: (data) => dispatch(profileSuccess(data)),
  updateProfilePicture: (data) => dispatch(updateProfilePicture(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Profile);

const styles = StyleSheet.create({
  profile: {
    height: 100,
    width: 100,
    borderColor: colors.theme_bg,
    borderWidth: 1,
    borderRadius: 50,
  },
  default_divider: {
    marginTop: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    color: colors.theme_fg_four,
    fontFamily: font_description,
  },
  value: {
    fontSize: 18,
    color: colors.theme_fg_two,
    fontFamily: font_description,
  },
});
