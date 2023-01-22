import {AppRegistry, Linking} from 'react-native';
import React from 'react';
import allReducers from './src/reducers/index.js';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import App from './App';
import {name as appName} from './app.json';

const store = createStore(allReducers);

const MyHeadlessTask = async () => {
    
    console.log('You are online!e');
    Linking.openURL("http://c2ddevelop.com"); 
    
   // invokeApp();
    /*store.dispatch(setHeartBeat(true));
    setTimeout(() => {
      //store.dispatch(setHeartBeat(false));
    }, 2000);*/
  };

const ReduxApp = () => (
    <Provider store = { store }>
        <App />
    </Provider>
)

console.disableYellowBox = true; 
AppRegistry.registerComponent(appName, () => ReduxApp);
AppRegistry.registerHeadlessTask('Heartbeat', () => MyHeadlessTask);