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
import PanPasswordLogin from './PanPasswordLogin'
import Video from 'react-native-video'

class MainPage extends Component {
  constructor(props){
    super(props)
  }

  componentDidMount() {

  }

  renderScene(route, navigator) {
    if (!route) {
      console.log('render PanPasswordLogin');
      return (
        <PanPasswordLogin navigator/>
      );
    }
    var Component = route.component;
    return <Component />;
  }

  render() {
    return (
      <View style={{backgroundColor:'yellow',height:200,width:200,}}>
        <Video
           source={{uri:'http://cdn.image.aiyingwujia.com/4419ba1d2f7a2aee.mp4'}}
           rate={1.0}
           volume={1.0}
           muted={false}
           paused={false}
           resizeMode="cover"
           repeat={true}
           playInBackground={false}
           playWhenInactive={false}
           onLoad={e => {}}
           onProgress={e => {}}
           onEnd={() => {}}
           onError={() => {
             console.log('error');
           }}
           style={styles.backgroundVideo} />
      </View>
      );
  }
}

const styles = StyleSheet.create({
  backgroundVideo: {
    position: 'absolute',
    backgroundColor:'yellow',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});

module.exports = MainPage;
