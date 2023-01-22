import React, { Component } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, ScrollView} from 'react-native';
import { api_url, upload_icon, font_title, get_documents, font_description, img_url, id_proof_upload, id_proof_update, vehicle_image_upload, vehicle_image_update, vehicle_certificate_update, vehicle_insurance_update, id_proof_icon, vehicle_certificate_icon, vehicle_insurance_icon, vehicle_image_icon} from '../config/Constants';
import * as colors from '../assets/css/Colors';
import axios from 'axios';
import { connect } from 'react-redux';
import strings from "../languages/strings.js";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from "react-native-image-picker";
import RNFetchBlob from "rn-fetch-blob";
import ImgToBase64 from 'react-native-image-base64';
import Loader from '../components/Loader';

const options = {
  title: 'Select a photo',
  takePhotoButtonTitle: 'Take a photo',
  chooseFromLibraryButtonTitle: 'Choose from gallery',
  base64: true,
  quality:1, 
  maxWidth: 500, 
  maxHeight: 500,
};

class Document extends Component<Props>{
  constructor(props){
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = { 
      validation:true,
      id_proof:{
        path:id_proof_icon,
        status:0,
        status_name:strings.waiting_for_upload,
        color:colors.warning
      },
      vehicle_certificate:{
        path:vehicle_certificate_icon,
        status:0,
        status_name:strings.waiting_for_upload,
        color:colors.warning
      },
      vehicle_insurance:{
        path:vehicle_insurance_icon,
        status:0,
        status_name:strings.waiting_for_upload,
        color:colors.warning
      },
      vehicle_image:{
        path:vehicle_image_icon,
        status:0,
        status_name:strings.waiting_for_upload,
        color:colors.warning
      },
      vehicle_id:0,
      upload_status:0,
      isLoading:false
    }
    
  }

  async componentDidMount(){
    this._unsubscribe = await this.props.navigation.addListener("focus", async() => {
      this.get_documents();
    });
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  find_document = (list) =>{
    list.map((data,index) => {
      let value = { path:{ uri : img_url + data.path },status:data.status, status_name:data.status_name, color:this.get_status_foreground(data.status)}
      if(data.document_name == 'id_proof'){
        this.setState({ id_proof : value });
      }else if(data.document_name == 'vehicle_certificate'){
        this.setState({ vehicle_certificate : value });
      }else if(data.document_name == 'vehicle_image'){
        this.setState({ vehicle_image : value });
      }else if(data.document_name == 'vehicle_insurance'){
        this.setState({ vehicle_insurance : value });
      }
    })
  }

  get_status_foreground = (status) =>{
		if(status == 17){
			return colors.error
		}else if(status == 14 || status == 15){
			return  colors.warning
		}else if(status == 16){
			return colors.success  
		}
	}

  move_to_upload = (slug,status,path) =>{
    let table = slug == "id_proof" ? "drivers" : "driver_vehicles";
    let find_field = slug == "id_proof" ? "id" : "id";
    let find_value = slug == "id_proof" ? global.id : this.state.vehicle_id;
    let status_field = slug == "id_proof" ? 'id_proof_status' : slug+'_status';
    if(status == 14){
      this.props.navigation.navigate("DocumentUpload",{ slug:slug, path:upload_icon, status:status, table:table, find_field:find_field, find_value:find_value, status_field : status_field });
    }else{
      this.props.navigation.navigate("DocumentUpload",{ slug:slug, path:path, status:status, table:table, find_field:find_field, find_value:find_value, status_field : status_field });
    }
  }

  handleBackButtonClick= () => {
    this.props.navigation.goBack(null);
  }

  get_documents = async () => {
    this.setState({ isLoading : true });
    await axios({
      method: 'post', 
      url: api_url + get_documents,
      data:{ driver_id : global.id, lang: global.lang}
    })
    .then(async response => {
      this.setState({ isLoading : false });
      this.setState({ vehicle_id:response.data.result.details.vehicle_id});
      if(response.data.result.documents[0].status == 15 && response.data.result.documents[1].status == 15 && response.data.result.documents[2].status == 15 && response.data.result.documents[3].status == 15){
        this.setState({ upload_status : 1 });
      }else{
        this.find_document(response.data.result.documents)
      }
    })
    .catch(error => {
      this.setState({ isLoading : false });
      alert(strings.sorry_something_went_wrong);
    });
  }

   render() {
    return (
    <ScrollView style={styles.container}>
      {this.state.upload_status == 0 ?
      <View style={{ padding:10 }}>
        <View>
          <Text style={{ fontFamily:font_title, color:colors.theme_fg, fontSize:25}}>
            {strings.upload_your_documents} (4)
          </Text>
          <View style={{ margin:5 }} />
          <Text style={{ fontFamily:font_description, color:colors.grey, fontSize:12}}>
            {strings.in_order_to_complete_your_registration_please_upload_following_documents}
          </Text>
        </View>
        <View style={{ margin:10 }} />
        <View>
          <Text style={{ fontFamily:font_title, color:colors.theme_fg_two, fontSize:18}}>
            {strings.id_proof}
          </Text>
          <Text style={{ fontFamily:font_description, color:colors.grey, fontSize:12}}>
            {strings.make_sure_that_every_details_of_the_document_is_clearly_visible}
          </Text>
          <View style={{ margin:10 }} />
          <TouchableOpacity onPress={this.move_to_upload.bind(this,'id_proof',this.state.id_proof.status,this.state.id_proof.path)} activeOpacity={1} style={{ borderWidth:1, padding:10, borderRadius:5, borderStyle:'dashed', flexDirection:'row'}}>
              <View style={{ width:'70%'}}>
                <Text style={{ fontFamily:font_title, color:this.state.id_proof.color, fontSize:14}}>{this.state.id_proof.status_name}</Text>
                <View style={{ margin:5 }} />
                <Text style={{ fontFamily:font_description, color:colors.grey, fontSize:12}}>{strings.upload_your_passport_or_driving_licence_or_any_one_id_proof}</Text>
              </View>
              <View style={{ width:'30%', alignItems:'center', justifyContent:'center'}}>
                <Image source={this.state.id_proof.path} style={{ height:75, width:75}} />
              </View>
          </TouchableOpacity>
        </View>
        <View style={{ margin:10 }} />
        <View>
          <Text style={{ fontFamily:font_title, color:colors.theme_fg_two, fontSize:18}}>
            {strings.certificate}
          </Text>
          <Text style={{ fontFamily:font_description, color:colors.grey, fontSize:12}}>
            {strings.make_sure_that_every_details_of_the_document_is_clearly_visible}
          </Text>
          <View style={{ margin:10 }} />
          <TouchableOpacity onPress={this.move_to_upload.bind(this,'vehicle_certificate',this.state.vehicle_certificate.status,this.state.vehicle_certificate.path)} activeOpacity={1} style={{ borderWidth:1, padding:10, borderRadius:5, borderStyle:'dashed', flexDirection:'row'}}>
              <View style={{ width:'70%'}}>
                <Text style={{ fontFamily:font_title, color:this.state.vehicle_certificate.color, fontSize:14}}>{this.state.vehicle_certificate.status_name}</Text>
                <View style={{ margin:5 }} />
                <Text style={{ fontFamily:font_description, color:colors.grey, fontSize:12}}>{strings.upload_your_vehicle_registration_certificate}</Text>
              </View>
              <View style={{ width:'30%', alignItems:'center', justifyContent:'center'}}>
                <Image source={this.state.vehicle_certificate.path} style={{ height:75, width:75}} />
              </View>
          </TouchableOpacity>
        </View>
        <View style={{ margin:10 }} />
        <View>
          <Text style={{ fontFamily:font_title, color:colors.theme_fg_two, fontSize:18}}>
            {strings.vehicle_insurance}
          </Text>
          <Text style={{ fontFamily:font_description, color:colors.grey, fontSize:12}}>
            {strings.make_sure_that_every_details_of_the_document_is_clearly_visible}
          </Text>
          <View style={{ margin:10 }} />
          <TouchableOpacity onPress={this.move_to_upload.bind(this,'vehicle_insurance',this.state.vehicle_insurance.status,this.state.vehicle_insurance.path)} activeOpacity={1} style={{ borderWidth:1, padding:10, borderRadius:5, borderStyle:'dashed', flexDirection:'row'}}>
              <View style={{ width:'70%'}}>
                <Text style={{ fontFamily:font_title, color:this.state.vehicle_insurance.color, fontSize:14}}>{this.state.vehicle_insurance.status_name}</Text>
                <View style={{ margin:5 }} />
                <Text style={{ fontFamily:font_description, color:colors.grey, fontSize:12}}>{strings.upload_your_vehicle_insurance_document}</Text>
              </View>
              <View style={{ width:'30%', alignItems:'center', justifyContent:'center'}}>
                <Image source={this.state.vehicle_insurance.path} style={{ height:75, width:75}} />
              </View>
          </TouchableOpacity>
        </View>
        <View style={{ margin:10 }} />
        <View>
          <Text style={{ fontFamily:font_title, color:colors.theme_fg_two, fontSize:18}}>
            {strings.vehicle_image}
          </Text>
          <Text style={{ fontFamily:font_description, color:colors.grey, fontSize:12}}>
            {strings.upload_your_vehicle_image}
          </Text>
          <View style={{ margin:10 }} />
          <TouchableOpacity onPress={this.move_to_upload.bind(this,'vehicle_image',this.state.vehicle_image.status,this.state.vehicle_image.path)} activeOpacity={1} style={{ borderWidth:1, padding:10, borderRadius:5, borderStyle:'dashed', flexDirection:'row'}}>
              <View style={{ width:'70%'}}>
                <Text style={{ fontFamily:font_title, color:this.state.vehicle_image.color, fontSize:14}}>{this.state.vehicle_image.status_name}</Text>
                <View style={{ margin:5 }} />
                <Text style={{ fontFamily:font_description, color:colors.grey, fontSize:12}}>{strings.upload_your_vehicle_image_with_number_board}</Text>
              </View>
              <View style={{ width:'30%', alignItems:'center', justifyContent:'center'}}>
                <Image source={this.state.vehicle_image.path} style={{ height:75, width:75}} />
              </View>
          </TouchableOpacity>
        </View>
      </View>
      :
      <View style={{ padding:20, alignItems:'center', justifyContent:'center' }}>
        <Text style={{ fontFamily:font_title, color:colors.theme_fg_two, fontSize:20}}>Your documents are uploaded.Please wait admin will verify your documents.</Text>
      </View>
      }
    </ScrollView>
        
    )
  }
}

function mapStateToProps(state){
  return{
    isLoding : state.profile.isLoding,
    message : state.profile.message,
    status : state.profile.status,
    data : state.profile.data,
    id_proof : state.profile.id_proof
  };
}

const mapDispatchToProps = (dispatch) => ({
    editServiceActionPending: () => dispatch(editServiceActionPending()),
    editServiceActionError: (error) => dispatch(editServiceActionError(error)),
    editServiceActionSuccess: (data) => dispatch(editServiceActionSuccess(data)),
    updateServiceActionPending: () => dispatch(updateServiceActionPending()),
    updateServiceActionError: (error) => dispatch(updateServiceActionError(error)),
    updateServiceActionSuccess: (data) => dispatch(updateServiceActionSuccess(data)),
    updateProfilePicture: (data) => dispatch(updateProfilePicture(data)),
    updateIdProof: (data) => dispatch(updateIdProof(data)),
    registerPending: () => dispatch(registerPending()),
    registerError: (error) => dispatch(registerError(error)),
    registerSuccess: (data) => dispatch(registerSuccess(data)),
    createLoginPassword: (data) => dispatch(createLoginPassword(data))
});

export default connect(mapStateToProps,mapDispatchToProps)(Document);

const styles = StyleSheet.create({
    header:{
    backgroundColor:colors.theme_bg,
    height:70
  },
    flex_1:{
    flex: 1
  },
    icon:{
    color:colors.theme_fg_three
  },
    header_body: {
    flex: 3,
    justifyContent: 'center'
  },
  upload_image:{
    width: 150,
    height: 150,
    borderColor: colors.theme_bg_three,
    borderWidth: 1
  },
  body_section:{
    width: '100%', 
    backgroundColor: colors.theme_bg_three, 
    alignItems:'center', 
    justifyContent:'center',
    paddingTop:20,
    marginBottom:30,
    paddingBottom:20
  },
  footer_section:{
    width: '100%', 
    alignItems:'center',
    marginBottom:10
  },
    name_title:{
    alignSelf:'center', 
    color:colors.theme_fg,
    alignSelf:'center', 
    fontSize:20,
    letterSpacing:0.5,
    fontFamily:font_title
  },
});
