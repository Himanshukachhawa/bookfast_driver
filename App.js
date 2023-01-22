import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as colors from './src/assets/css/Colors';
import Icon, { Icons } from './src/components/Icons';
import * as Animatable from 'react-native-animatable';
import strings from "./src/languages/strings.js";

/* Screens */
import Splash from './src/views/Splash';
import LoginHome from './src/views/LoginHome';
import Login from './src/views/Login';
import Password from './src/views/Password';
import Forgot from './src/views/Forgot';
import ForgotOtp from './src/views/ForgotOtp';
import Otp from './src/views/Otp';
import ResetPassword from './src/views/ResetPassword';
import Duty from './src/views/Duty';
import Bookings from './src/views/Bookings';
import Training from './src/views/Training';
import Notification from './src/views/Notification';
import NotificationDetails from './src/views/NotificationDetails';
import More from './src/views/More';
import Profile from './src/views/Profile';
import EditFirstName from './src/views/EditFirstName';
import EditLastName from './src/views/EditLastName';
import EditPhoneNumber from './src/views/EditPhoneNumber';
import EditEmail from './src/views/EditEmail';
import EditPassword from './src/views/EditPassword';
import Faq from './src/views/Faq';
import FaqDetails from './src/views/FaqDetails';
import Wallet from './src/views/Wallet';
import RideDetails from './src/views/RideDetails';
import Earnings from './src/views/Earnings';
import KycVerification from './src/views/KycVerification';
import Withdrawal from './src/views/Withdrawal';
import TrainingDetails from './src/views/TrainingDetails';
import Trip from './src/views/Trip';
import BookingRequest from './src/views/BookingRequest';
import DirectBooking from './src/views/DirectBooking';
import Logout from './src/views/Logout';
import DriverRegisteration from './src/views/DriverRegisteration';
import DutyTypes from './src/views/DutyTypes';
import Chat from './src/views/Chat';
import Document from './src/views/Document';
import VehicleDetails from './src/views/VehicleDetails';
import Rating from './src/views/Rating';
import DocumentUpload from './src/views/DocumentUpload';
import SharedSettings from './src/views/SharedSettings';
import SharedTrip from './src/views/SharedTrip';

const forFade = ({ current, next }) => {
  const opacity = Animated.add(
    current.progress,
    next ? next.progress : 0
  ).interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 1, 0],
  });

  return {
    leftButtonStyle: { opacity },
    rightButtonStyle: { opacity },
    titleStyle: { opacity },
    backgroundStyle: { opacity },
  };
};

const TabArr = [
  { route: 'Duty', label:strings.home, type: Icons.FontAwesome, icon: 'car', component: Duty, color: colors.theme_fg, alphaClr: colors.theme_bg_three },
  { route: 'Bookings', label:strings.bookings, type: Icons.FontAwesome, icon: 'book', component: Bookings, color: colors.theme_fg, alphaClr: colors.theme_bg_three },
  { route: 'DirectBooking', label:strings.shot_booking, type: Icons.FontAwesome, icon: 'plus', component: DirectBooking, color: colors.theme_fg, alphaClr: colors.theme_bg_three },
  { route: 'More', label:strings.more, type: Icons.Ionicons, icon: 'settings', component: More, color: colors.theme_fg, alphaClr: colors.theme_bg_three },
];

const Tab = createBottomTabNavigator();

const TabButton = (props) => {
  const { item, onPress, accessibilityState } = props;
  const focused = accessibilityState.selected;
  const viewRef = useRef(null);
  const textViewRef = useRef(null);

  useEffect(() => {
    if (focused) { // 0.3: { scale: .7 }, 0.5: { scale: .3 }, 0.8: { scale: .7 },
      viewRef.current.animate({ 0: { scale: 0 }, 1: { scale: 1 } });
      textViewRef.current.animate({0: {scale: 0}, 1: {scale: 1}});
    } else {
      viewRef.current.animate({ 0: { scale: 1, }, 1: { scale: 0, } });
      textViewRef.current.animate({0: {scale: 1}, 1: {scale: 0}});
    }
  }, [focused])

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      style={[styles.container, {flex: focused ? 1 : 0.60}]}>
      <View>
        <Animatable.View
          ref={viewRef}
          style={[StyleSheet.absoluteFillObject, { backgroundColor: item.color, borderRadius: 16 }]} />
        <View style={[styles.btn, { backgroundColor: focused ? null : item.alphaClr }]}>
          <Icon type={item.type} name={item.icon} color={focused ? colors.theme_fg_three : colors.grey} />
          <Animatable.View
            ref={textViewRef}>
            {focused && <Text style={{
              color: colors.theme_fg_three, paddingHorizontal: 8
            }}>{item.label}</Text>}
          </Animatable.View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 60,
          position: 'absolute',
          bottom: 16,
          right: 16,
          left: 16,
          borderRadius: 16
        }
      }}
    >
      {TabArr.map((item, index) => {
        return (
          <Tab.Screen key={index} name={item.route} component={item.component}
            options={{
              tabBarShowLabel: false,
              tabBarButton: (props) => <TabButton {...props} item={item} />
            }}
          />
        )
      })}
    </Tab.Navigator>
  )
}

const Stack = createStackNavigator();

const linking = {
  prefixes: ['c2d://'],

  // Custom function to get the URL which was used to open the app
  async getInitialURL() {
    // First, you would need to get the initial URL from your third-party integration
    // The exact usage depend on the third-party SDK you use
    // For example, to get to get the initial URL for Firebase Dynamic Links:
    const { isAvailable } = utils().playServicesAvailability;

    if (isAvailable) {
      const initialLink = await dynamicLinks().getInitialLink();

      if (initialLink) {
        return initialLink.url;
      }
    }

    // As a fallback, you may want to do the default deep link handling
    const url = await Linking.getInitialURL();

    return url;
  },
  config: {

  }
};

function App() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator initialRouteName="Splash" options={{headerShown: false}}  >
      <Stack.Screen name="Home" component={TabNavigator} options={{headerShown: false}} />
      <Stack.Screen name="Splash" component={Splash} options={{headerShown: false}} />
      <Stack.Screen name="SharedTrip" component={SharedTrip} options={{headerShown: false}} />
      <Stack.Screen name="Login" component={Login} options={{title: strings.enter_your_mobile_number}} />
      <Stack.Screen name="LoginHome" component={LoginHome} options={{headerShown: false}} />
      <Stack.Screen name="BookingRequest" component={BookingRequest} options={{headerShown: false}} />
      <Stack.Screen name="Password" component={Password} options={{title: strings.enter_your_password}} />
      <Stack.Screen name="Trip" component={Trip} options={{headerShown: false}} />
      <Stack.Screen name="TrainingDetails" component={TrainingDetails} options={{title: 'Training Details'}} />
      <Stack.Screen name="Forgot" component={Forgot} options={{title: 'Forgot'}}/>
      <Stack.Screen name="ForgotOtp" component={ForgotOtp} options={{title: 'Enter Otp'}}/>
      <Stack.Screen name="ResetPassword" component={ResetPassword} options={{title: 'Reset Password'}} />
      <Stack.Screen name="Otp" component={Otp} options={{title: 'Enter Otp'}}/>
      <Stack.Screen name="Bookings" component={Bookings} options={{headerShown: false}} />
      <Stack.Screen name="Notification" component={Notification} options={{title:strings.notification}} />
      <Stack.Screen name="NotificationDetails" component={NotificationDetails} options={{title: 'Notification Details'}} />
      <Stack.Screen name="More" component={More} options={{headerShown: false}} />
      <Stack.Screen name="Profile" component={Profile} options={{title:strings.profile}} />
      <Stack.Screen name="Training" component={Training} options={{title:strings.training}}/>
      <Stack.Screen name="EditFirstName" component={EditFirstName} options={{title:strings.first_name}} />
      <Stack.Screen name="EditLastName" component={EditLastName} options={{title:strings.last_name}} />
      <Stack.Screen name="EditPhoneNumber" component={EditPhoneNumber} options={{title:strings.edit_phone_number}} />
      <Stack.Screen name="EditEmail" component={EditEmail} options={{title:strings.email}} />
      <Stack.Screen name="EditPassword" component={EditPassword} options={{title:strings.edit_password}} />
      <Stack.Screen name="Faq" component={Faq} options={{title:strings.faq}}/>
      <Stack.Screen name="FaqDetails" component={FaqDetails} options={{title: 'Faq Details'}} />
      <Stack.Screen name="Wallet" component={Wallet}options={{title:strings.wallet}} />
      <Stack.Screen name="RideDetails" component={RideDetails} options={{title: 'Ride Details'}}/>
      <Stack.Screen name="Earnings" component={Earnings} options={{title:strings.earnings}} />
      <Stack.Screen name="KycVerification" component={KycVerification} options={{title:strings.kyc_verification}} />
      <Stack.Screen name="Withdrawal" component={Withdrawal} options={{title:strings.withdrawal}} />
      <Stack.Screen name="Logout" component={Logout} options={{headerShown: false}} />
      <Stack.Screen name="DriverRegisteration" component={DriverRegisteration} options={{title: 'Registration'}} />
      <Stack.Screen name="DutyTypes" component={DutyTypes} options={{title: 'Duty Types'}} />
      <Stack.Screen name="Document" component={Document} options={{title:strings.document}}/>
      <Stack.Screen name="VehicleDetails" component={VehicleDetails} options={{title: 'Vehicle Details'}}/>
      <Stack.Screen name="Chat" component={Chat} options={{title: 'Customer Chat'}} />
      <Stack.Screen name="Rating" component={Rating} options={{headerShown: false}}/>
      <Stack.Screen name="DocumentUpload" component={DocumentUpload} options={{ title: 'Document Upload' }} />
      <Stack.Screen name="SharedSettings" component={SharedSettings} options={{ title: 'Settings' }} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
  }
})

export default App;