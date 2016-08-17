import React, {Component, PropTypes} from 'react'
import {
  View,
  Text,
  Image,
  Navigator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import constants from './Utils/constants'

class Start extends Component {
  constructor(props){
    super(props)
  }

  componentDidMount() {
    setTimeout( () => {
      this.refs.navigator.replace({
        component: require('./index'),
      });
    }, 3000);
  }

  renderScene(route, navigator) {
    if (!route) {
      return (
        <View
          style={{
            width: constants.screen.width,
            height: constants.screen.height,
            backgroundColor: 'pink'
          }}
          />
      );
    }

    var Component = route.component;
    return <Component navigator={navigator}/>;
  }

  render() {
    return (
      <Navigator
        ref='navigator'
        style={{flex: 1}}
        configureScene={() => Navigator.SceneConfigs.FloatFromRight}
        renderScene={this.renderScene}
        sceneStyle={{flex: 1}}
      />
      );
  }
}

module.exports = Start;
