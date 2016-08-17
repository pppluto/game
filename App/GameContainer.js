var React = require('react');
var ReactNative = require('react-native');
var {
  View,
  Text,
  Alert,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  TouchableOpacity
} = ReactNative;
var Game = require('./Game');
var TimerMixin = require('react-timer-mixin');
var Button = require('./Utils/Button');
var SCREEN_WIDTH = Dimensions.get('window').width;
var SCREEN_HEIGHT = Dimensions.get('window').height;
var MAIN_COLOR = 'rgb(73,185,251)';
var MAX_TIME = 60 * 60 * 10; //one hour (1 : 100ms)
var TimerText = React.createClass({
  propTypes: {
    duration:React.PropTypes.number.isRequired,
  },

  getInitialState:function() {
    return {
      duration: 0,
    }
  },

  setNativeProps(props) {
      this.setState(props);
  },

  render: function() {
    return (
      <Text style={{flex:1,textAlign:'left',fontSize:15,alignSelf:'center',margin:10}}>{this.state.duration / 10 + 's'}</Text>
    )
  },
});

var TestGame = React.createClass({
  mixins: [TimerMixin],

  statics:{
    title: 'Numbers',
  },

  getInitialState: function() {
    return {
      count: 0,
      initialDate:0,
      duration:0,
      totalValue: 0,
      targetNumber: 0,
      allPieceValue:[],
      answerIndexes: [],
      userSelected: [],
      isOver: false,
      round: 1,
      currentLevel: 1,
      totalPieces: 16,
    };
  },

  componentDidMount: function() {
    this.resetGame();
    this.toggleTimer();
  },

  componentWillUnmount: function() {
    this._timer && this.clearTimer(this._timer);
    this._interval && this.clearInterval(this._interval);
  },

  toggleTimer: function() {
    if (this._interval) {
      this._interval && this.clearInterval(this._interval);
      this._interval = undefined;
    } else {
      this._interval = this.setInterval(() => {
        if (this.state.duration > MAX_TIME) {
          this.state.duration = 0;
        }
        this.state.duration = this.state.duration + 1;
        this.refs['timer'].setNativeProps({duration:this.state.duration})
      },100);
    }

  },

  resetGame: function() {
    var base = [10,15,20][this.state.currentLevel - 1];
    var targetNumber = Math.floor(Math.random() * base) + base;
    this.state.totalPieces = Math.pow(this.state.currentLevel + 3,2);
    var count = this.state.currentLevel + Math.floor(this.state.round / 3);
    var game = new Game();
    game.totalPieces = this.state.totalPieces;
    var answerSequence = game.createAnswerSequence(targetNumber,count);
    var answerIndexes = game.createAnswerIndexes(answerSequence.length);
    var allPieceValue = game.createAllPieceValue(targetNumber);

    answerIndexes.forEach( (index,i_index) => {
      allPieceValue[index] = answerSequence[i_index];
    });
    this.setState({
      targetNumber,
      allPieceValue,
      answerIndexes,
    });
  },

  clearGame: function() {
    if (this.state.userSelected.length) {
      this.state.userSelected.forEach( v => {
        this.refs['button' + v].setNativeProps({style:{backgroundColor:'white'}});
      });
    }

    this.state.answerIndexes.forEach( v => {
      this.refs['button' + v].setNativeProps({style:{backgroundColor:'white'}});
    });
    this.state.userSelected = [];
    this.state.totalValue = 0;
    this.setState({isOver:false});
  },

  showAnswer: function() {
    if (this.state.isOver) {
      return;
    }

    if (this.state.userSelected.length) {
      this.state.userSelected.forEach( v => {
        this.refs['button' + v].setNativeProps({style:{backgroundColor:'white'}});
      });
    }

    this.setState({isOver:true});
    this.state.answerIndexes.forEach( v => {
      this.refs['button' + v].setNativeProps({style:{backgroundColor:MAIN_COLOR}});
    });
  },

  onButtonClick: function(index) {
    if (!this._interval) {
      return Alert.alert('警告','请开始游戏');
    }

    if (this.state.isOver) {
      return;
    }

    if (this.state.userSelected.indexOf(index) >= 0 ) {
      return;
    }
    var userSelected = this.state.userSelected;
    var centerIndex = userSelected.length ? userSelected[userSelected.length - 1] : index;
    if (new Game().isNearBy(centerIndex,index,Math.sqrt(this.state.totalPieces))) {
      userSelected.push(index);
      this.state.totalValue = this.state.totalValue + this.state.allPieceValue[index];
      // this.setState({userSelected});
      this.refs['button' + index].setNativeProps({style:{backgroundColor:MAIN_COLOR}});
      this.state.userSelected = userSelected;
    } else {
      Alert.alert('警告','之允许选择相邻的数字块');
      return;
    }

    if (this.state.totalValue === this.state.targetNumber) {

      Alert.alert('提示','完成!');
      var round = this.state.round;
      var currentLevel = this.state.currentLevel;
      round += 1;
      if (round > 5) {
        round = 1;
        currentLevel += 1;
        //TODO  bonus based level up! credit or dragon ball. record statistics per day
        switch (currentLevel) {
          case 2:
          Alert.alert('提示','成功完成第一关');
           break;
          case 3:
          Alert.alert('提示','成功完成第二关');
            break;
          case 4:
          Alert.alert('提示','通关了!');
          this.state.duration = 0;
          this.toggleTimer();
          //reset all
          currentLevel = 1;
            break;
          default:

        }
      }

      this.setState({round,currentLevel});
      this._timer = setTimeout(() => {
        this.clearGame();
        this.resetGame();
      }, 1000);
    }
  },

  render: function() {
    return (
      <View style={{position:'absolute',top:0,bottom:0,left:0,right:0,backgroundColor:'white'}}>
        <StatusBar backgroundColor={MAIN_COLOR} barStyle="light-content" />
        {Platform.OS === 'android' ? null : <View style={{width:SCREEN_WIDTH,height:20,backgroundColor:MAIN_COLOR}}/>}
        <View style={{flexDirection:'row',width:SCREEN_WIDTH,height:44, justifyContent:'center',backgroundColor:MAIN_COLOR}}>
          <Button
            title={'<'}
            onPress={() => {
              this.props.navigator.pop();
            }}/>
          <Text style={{fontSize:20,alignSelf:'center',color:'white'}}>{'Numbers'}</Text>
        </View>

        <View style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'space-around'}}>
          <Text style={{marginBottom:5,fontSize:20,alignSelf:'center'}}>{'关卡: ' + this.state.round}</Text>
          <Text style={{marginBottom:5,fontSize:20,alignSelf:'center'}}>{'难度: ' + this.state.currentLevel}</Text>
        </View>

        <View style={{flexDirection:'row',justifyContent:'space-around'}}>
          {Array.from({length:4}, v => v).map( (value, index) => {
            var text = ['重置', '清除', '提示','暂停/开始'][index];
            return (
              <TouchableOpacity
                key={index + 'value'}
                activeOpacity={0.7}
                onPress={() => {
                  if (!this._interval && index < 2 && index > 0) {
                    return Alert.alert('警告','请开始游戏');
                  }
                  switch (index) {
                    case 0:
                      this.clearGame();
                      return this.resetGame();
                    case 1:
                      return this.clearGame();
                    case 2:
                      return this.showAnswer();
                    case 3:
                      return this.toggleTimer();
                    default:
                      return;
                  }
                }}>
                <View style={[styles.button,{flex:1}]}>
                  <Text style={{color:'white'}}>{text}</Text>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>

        <View style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'space-around'}}>
          <Text style={{flex:1,textAlign:'center',fontSize:15,alignSelf:'center',margin:10}}>{'目标数字: ' + this.state.targetNumber}</Text>
          <View style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'space-around'}}>
            <Text style={{flex:1,textAlign:'right',fontSize:15,alignSelf:'center',marginVertical:10}}>{'时间: '}</Text>
            <TimerText ref={'timer'} duration={this.state.duration}/>
          </View>
        </View>
        <View style={{width:SCREEN_WIDTH,flexWrap:'wrap',flexDirection:'row'}}>
          {Array.from({length:this.state.totalPieces},(k,v) => {return v;}).map( (v, index) => {
            // var highlightIndexes = this.state.isOver ? this.state.answerIndexes : this.state.userSelected;
            // var color = highlightIndexes.indexOf(index) >= 0 ? MAIN_COLOR : 'white';
            return (
              <View
                key={index}
                ref={'button' + index}
                style={[styles.rect,{
                  // backgroundColor:color,
                  width: SCREEN_WIDTH / Math.sqrt(this.state.totalPieces),
                  height: SCREEN_WIDTH / Math.sqrt(this.state.totalPieces)
                }]}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.innerRect,{
                    width: SCREEN_WIDTH / Math.sqrt(this.state.totalPieces) - 4,
                    height: SCREEN_WIDTH / Math.sqrt(this.state.totalPieces) - 4,
                  }]}
                  onPress={this.onButtonClick.bind(this,index)}>
                  <Text style={{color:'grey',fontSize:20,alignSelf:'center'}}>{this.state.allPieceValue[index] || 0}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>
      );
  },
});

const styles = StyleSheet.create({
  button:{
    // width: 80,
    // height: 40,
    padding:15,
    borderRadius: 5,
    backgroundColor: MAIN_COLOR,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rect: {
    borderColor: 'rgb(120,100,150)',
    borderWidth: 1,

  },
  innerRect: {

    justifyContent: 'center',
  },
});

module.exports = TestGame;
