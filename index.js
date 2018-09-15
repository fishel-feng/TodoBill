/** 
 * index.js
 * @format 
 * @flow
 */ 

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import Storage from 'react-native-storage';
import { AsyncStorage } from 'react-native';

global.storage = new Storage({
  size: 1000,
  storageBackend: AsyncStorage,
  defaultExpires: null,
  enableCache: true 	
});

AppRegistry.registerComponent(appName, () => App);
