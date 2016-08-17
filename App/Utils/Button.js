var React = require('react');
var ReactNative = require('react-native');
var {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} = ReactNative;
var TimerMixin = require('react-timer-mixin');

var Button = React.createClass({
  mixins: [TimerMixin],

  PropTypes: {
    title: React.PropTypes.string,
    containStyle: React.PropTypes.object,
    titleStyle: React.PropTypes.object,
    onPress: React.PropTypes.func,
  },

  getDefaultProps: function () {
    return {
      title: 'Button',
      titleStyle: {fontSize: 15,color:'white'},
      onPress: () => {},
    };
  },

  handlePress: function () {
    this.requestAnimationFrame(() => {
      this.props.onPress();
    });
  },

  render: function() {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={this.props.onPress}>
        <View style={[styles.defaultStyle,this.props.containStyle,styles.shadow]}>
          <Text style={[this.props.titleStyle]}>{this.props.title}</Text>
        </View>
      </TouchableOpacity>
    );
  },
});

var styles = StyleSheet.create({
  defaultStyle: {
    margin: 5,
    alignSelf: 'center',
    borderRadius: 5,
    backgroundColor: 'rgb(73,185,251)',
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  shadow:{
    shadowColor: 'white',
    shadowOffset: {width:2,height:2},
    shadowOpacity: 0.7,
  },
});
module.exports = Button;
