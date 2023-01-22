import React, { Component } from 'react';
import { StyleSheet, View, SafeAreaView, Text, TouchableOpacity, Image } from 'react-native';
import {  bold, api_url, image_upload, img_url, update_document } from '../config/Constants';
import * as colors from '../assets/css/Colors';
import axios from 'axios';
import * as ImagePicker from "react-native-image-picker";
import RNFetchBlob from "rn-fetch-blob";
import ImgToBase64 from 'react-native-image-base64';
import Loader from '../components/Loader';
import strings from "../languages/strings.js";

const options = {
    title: 'Select a photo',
    takePhotoButtonTitle: 'Take a photo',
    chooseFromLibraryButtonTitle: 'Choose from gallery',
    base64: true,
    quality:1, 
    maxWidth: 500, 
    maxHeight: 500,
  };

class DocumentUpload extends Component<Props>{
    constructor(props){
        super(props)
        this.state = { 
            status:this.props.route.params.status,
            slug:this.props.route.params.slug,
            path:this.props.route.params.path,
            isLoading:false,
            table:this.props.route.params.table,
            find_field:this.props.route.params.find_field,
            find_value:this.props.route.params.find_value,
            status_field:this.props.route.params.status_field,
            imgData:""
        }
    }

    select_photo = async() => {
        ImagePicker.launchImageLibrary(options, async(response) => {
        if (response.didCancel) {
            console.log('User cancelled image picker');
        } else if (response.error) {
            console.log('ImagePicker Error: ', response.error);
        } else {
            const source = response.assets[0].uri;
            this.setState({ imgData : response.assets[0].uri });
            ImgToBase64.getBase64String(response.assets[0].uri)
            .then(async base64String => {
                    await this.upload_document(base64String);
                }
            )
            .catch(err => console.log(err));
        }
        });
    }

    upload_document = async(data) =>{
        await this.setState({ isLoading : true });
        RNFetchBlob.fetch('POST', api_url + image_upload, {
          'Content-Type' : 'multipart/form-data',
        }, [
          {  
            name : 'image',
            filename : 'image.png', 
            data: data
          },
          {  
            name : 'upload_path',
            data: 'drivers/vehicle_documents'
          }
        ]).then(async (resp) => { 
          console.log(resp)
          await this.setState({ isLoading : false });
          let data = await JSON.parse(resp.data);
          if(data.result){
            this.update_document(data.result);
          }
        }).catch((err) => {
            this.setState({ isLoading : false });
            alert(strings.error_on_while_upload_try_again_later)
        })
    }


    update_document = async(path) => {
        console.log({ table:this.state.table, find_field:this.state.find_field, find_value:this.state.find_value, update_field:this.state.slug, update_value:path, status_field:this.state.status_field })
		await axios({
			method: 'post', 
			url: api_url + update_document,
			data:{ table:this.state.table, find_field:this.state.find_field, find_value:this.state.find_value, update_field:this.state.slug, update_value:path, status_field:this.state.status_field }
		})
		.then(async response => {
            if(response.data.status == 1){
                this.setState({ path : { uri : img_url + path }, status:15 });
            }
		})
		.catch(error => {
			alert(strings.sorry_something_went_wrong)
		});
	}

    show_button = () =>{
        if(this.state.status == 14 || this.state.status == 17){
            return <TouchableOpacity onPress={this.select_photo.bind(this)} style={{ height:40, position:'absolute', bottom:10, width:'100%', backgroundColor:colors.theme_bg, padding:10, alignItems:'center', justifyContent:'center', width:'90%', marginLeft:'5%', borderRadius:10}}>
                <Text style={{ fontFamily:bold, color:colors.theme_fg_three, fontSize:16}}>
                    {strings.Upload_File}
                </Text>
            </TouchableOpacity>
        }
    }

    render() {
        return(
            <SafeAreaView style={styles.container}>
                <Loader visible={this.state.isLoading}/>
                <View style={{ marginBottom:40, alignItems:'center', justifyContent:'center' }}>
                    <View style={{ height:200, width:200}}>
                        <Image source={this.state.path} style={{ flex:1, height:undefined, width:undefined }} />
                    </View>
                    <View style={{ margin:10 }} />
                    {this.state.status == 14 &&
                        <Text style={{ fontFamily:bold, color:colors.theme_fg, fontSize:16}}>{strings.Upload_your_file}</Text>
                    }
                </View>
                {this.show_button()}
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor:colors.theme_bg_three
    }
  });

export default DocumentUpload;