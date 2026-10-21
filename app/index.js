import './global.css';
import { Appearance, AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

Appearance.setColorScheme('light');

AppRegistry.registerComponent(appName, () => App);
