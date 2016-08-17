import React, {Component, PropTypes} from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';

import TabNavigator from 'react-native-tab-navigator';

var MainPage = require('./MainPage');
var PanPasswordLogin = require('./PanPasswordLogin');
var GameContainer = require('./GameContainer');
class AppDemo extends Component {
    constructor(props){
        super(props);
        this.state = {
          selectedTab: 'home'
        };
    }

    render() {
      return (
        <TabNavigator>
          <TabNavigator.Item
            selected={this.state.selectedTab === 'home'}
            title="Home"
            badgeText="1"
            renderIcon={() => <Image source={require('./assets/logo.png')} style={{height:30,width:30}}/>}
            onPress={() => this.setState({ selectedTab: 'home' })}>
            <View style={{flex:1}}>
              <PanPasswordLogin navigator={this.props.navigator} />
            </View>
          </TabNavigator.Item>
          <TabNavigator.Item
            selected={this.state.selectedTab === 'message'}
            title="Message"
            renderIcon={() => <Image source={require('./assets/logo.png')} />}
            onPress={() => this.setState({ selectedTab: 'message' })}>
            <MainPage />
          </TabNavigator.Item>
          <TabNavigator.Item
            selected={this.state.selectedTab === 'game'}
            title="Game"
            renderIcon={() => <Image source={require('./assets/logo.png')} />}
            onPress={() => this.setState({ selectedTab: 'game' })}>
            <View style={{flex:1}}>
              <GameContainer navigator={this.props.navigator} />
            </View>
          </TabNavigator.Item>
          <TabNavigator.Item
            selected={this.state.selectedTab === 'profile'}
            title="Profile"
            renderIcon={() => <Image source={require('./assets/logo.png')} />}
            onPress={() => this.setState({ selectedTab: 'profile' })}>
            <View style={{flex:1,justifyContent:'flex-end',alignItems:'center'}}>
              <Text>ProfileView</Text>
            </View>
          </TabNavigator.Item>
        </TabNavigator>
      );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

module.exports = AppDemo;
