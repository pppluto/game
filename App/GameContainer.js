var React = require('react-native');
var {
  View,
  Text,
  Modal,
  Image,
  AppState,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
} = React;
var Game = require('./Game');
var TimerMixin = require('react-timer-mixin');
var Button = require('./utils/Button');
var SCREEN_WIDTH = Dimensions.get('window').width;
var SCREEN_HEIGHT = Dimensions.get('window').height;
var SELECT_COLOR = '#f5b1a2';
var MAIN_COLOR = '#86cdd0';
var BOARD_WIDTH = SCREEN_WIDTH - 20;
// var MAX_TIME = 30 * 60 * 10; //half of an hour (1 : 100ms)

var TimerText = React.createClass({
  propTypes: {
    remainTime:React.PropTypes.number.isRequired,
  },

  getInitialState:function() {
    return {
      remainTime: 0,
    };
  },

  setNativeProps(props) {
      this.setState(props);
  },

  render: function() {
    return (
      <Text style={{flex:1,textAlign:'left',fontSize:15,alignSelf:'center',margin:10}}>{this.state.remainTime / 10 + 's'}</Text>
    );
  },
});

var CountDownBlock = React.createClass({
  mixins: [TimerMixin],

  propTypes: {
    cb:React.PropTypes.func,
  },

  getInitialState:function() {
    return {
      index:3,
    };
  },

  componentDidMount: function() {
    this._interval = this.setInterval(() => {
      if (this.state.index <= 0) {
        this.props.cb && this.props.cb();
        return;
      }
      this.setState({index: this.state.index - 1});
    },1000);
  },

  componentWillUnmount: function() {
    this._interval && this.clearInterval(this._interval);
  },

  render: function() {
    var tmp = ['游戏开始','1','2','3'][this.state.index];
    return (
      <Text style={{fontSize:30,alignSelf:'center',color:'white'}}>{tmp}</Text>
    );
  },
});

var GameContainer = React.createClass({
  mixins: [TimerMixin],

  propTypes: {
    navigator: React.PropTypes.object.isRequired,
    level: React.PropTypes.number,
    limitTime: React.PropTypes.number,
  },

  getInitialState: function() {
    return {
      remainTime:this.props.limitTime / 100,
      totalValue: 0,
      targetNumber: 0,
      allPieceValue:[],
      answerIndexes: [],
      userSelected: [],
      round: 1,
      currentLevel: this.props.level || 1,
      totalPieces: 16,  //default, base on level. changed when resetGame
      visible: true,
      isChanllengeMode: false,
      hintLeft: new Animated.Value(0),
      guessHint: '',
    };
  },

  componentDidMount: function() {
    AppState.addEventListener('change',this.appStateChange);
    this.resetGame();
  },

  componentWillUnmount: function() {
    AppState.removeEventListener('change',this.appStateChange);
    this._timer && this.clearTimeout(this._timer);
    this._interval && this.clearInterval(this._interval);
  },

  appStateChange: function() {
    if (AppState.currentState === 'active') {
      if (this._changeToBackGroundTime) {
        var offset = Math.floor((new Date().getTime() - this._changeToBackGroundTime) / 100);
        this.state.remainTime = this.state.remainTime - offset;
      }
    }
    if (AppState.currentState === 'background') {
      if (this._interval) {
        this._changeToBackGroundTime = new Date().getTime();
      }
    }
  },

  toggleTimer: function() {
    if (this._interval) {
      this._interval && this.clearInterval(this._interval);
      this._interval = undefined;
    } else {
      this._interval = this.setInterval(() => {
        if (this.state.remainTime <= 0) {
          this.state.remainTime = 0;
          this.refs.timer.setNativeProps({remainTime:this.state.remainTime});
          this.gameOver();
          return;
        }
        // console.log('interval');
        this.state.remainTime = this.state.remainTime - 1;
        this.refs.timer.setNativeProps({remainTime:this.state.remainTime});
      },100);
    }

  },

  gameOver: function() {
    this._interval && this.clearInterval(this._interval);
    this._interval = undefined;
    if (this.state.isChanllengeMode) {
      Alert.alert(
        '提示',
        '本次挑战记录为:' + this.state.round + '\n挑战排行即将来临，排名靠前还会有奖励哦!',
        [{text:'重新挑战',() => {
          this.setState({round:1,remainTime: 5 * 60 * 10},() => {
            this.toggleTimer();
          });
          this.clearGame();
          this.resetGame();
        }
      }]);
      return;
    }
    Alert.alert(
      '提示',
      '时间到',
      [{text:'重新挑战',() => {
        this.setState({round:1,remainTime: this.props.limitTime / 100},() => {
          this.toggleTimer();
        });
        this.resetGame();
      }
    }]);
    return;
  },

  resetGame: function() {
    var base = [10,15,20,25][this.state.currentLevel - 1];
    var targetNumber = Math.floor(Math.random() * base) + this.state.round + Math.floor(base / 2) + 5;
    this.state.totalPieces = Math.pow(this.state.currentLevel + 3,2);
    var count = this.state.currentLevel + Math.floor(this.state.round / 5);
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
        this.refs['button' + v].setNativeProps({style:{backgroundColor:MAIN_COLOR}});
      });
    }

    this.state.answerIndexes.forEach( v => {
      this.refs['button' + v].setNativeProps({style:{backgroundColor:MAIN_COLOR}});
    });
    this.state.userSelected = [];
    this.state.totalValue = 0;
  },

  showAnswer: function() {

    if (this.state.userSelected.length) {
      this.state.userSelected.forEach( v => {
        this.refs['button' + v].setNativeProps({style:{backgroundColor:MAIN_COLOR}});
      });
    }

    this.state.answerIndexes.forEach( v => {
      this.refs['button' + v].setNativeProps({style:{backgroundColor:SELECT_COLOR}});
    });
  },

  onButtonClick: function(index) {

    if (this.state.userSelected.indexOf(index) >= 0 ) {
      return;
    }
    var userSelected = this.state.userSelected;
    var centerIndex = userSelected.length ? userSelected[userSelected.length - 1] : index;
    if (new Game().isNearBy(centerIndex,index,Math.sqrt(this.state.totalPieces))) {
      userSelected.push(index);
      this.state.totalValue = this.state.totalValue + this.state.allPieceValue[index];

      this.refs['button' + index].setNativeProps({style:{backgroundColor:SELECT_COLOR}});
      this.state.userSelected = userSelected;
    } else {
      Alert.alert('提示','只允许选择相邻的数字块');
      return;
    }

    if (this.state.totalValue === this.state.targetNumber) {

      this.showHint('完成!');

      // round = 10,非挑战模式下进入。(奖励)
      if (this.state.round >= 10 && !this.state.isChanllengeMode) {
        this.toggleTimer();
        this.getGameBonus(this.state.currentLevel * 10);
        return;
      }
      this.setState({round:this.state.round + 1});
      this._timer = setTimeout(() => {
        this.clearGame();
        this.resetGame();
      }, 1000);
    }
  },

  getGameBonus: function(round) {

    //TODO
    Alert.alert('提示','恭喜你通关了');
  },

  goChanllenge: function() {
    //通关困难，可以进入挑战模式。否则返回。
    if (this.state.currentLevel === 3) {
      Alert.alert('提示','挑战模式',[
        {text:'取消',() => {}},
        {text:'确定',() => {
          this.setState({round:1,remainTime: 5 * 60 * 10,isChanllengeMode: true});
          this._interval = undefined;
          this.toggleTimer();
          this.clearGame();
          this.resetGame();
        }}
      ]);
    }
  },

  showHint: function(guessHint) {
    this.setState({guessHint:guessHint});
    Animated.sequence([
      Animated.delay(250),
      Animated.timing(this.state.hintLeft,{
        toValue:1,
        duration:250,
      }),
      Animated.delay(1000),
      Animated.timing(this.state.hintLeft,{
        toValue:0,
        duration: 250,
      })
    ]).start();
  },

  setModalVisible: function(isVisible) {
    this.setState({visible:isVisible});
  },

  renderModal: function() {
    return (
      <View style={{alignSelf:'center'}}>
        <CountDownBlock cb={() => {
            this.setModalVisible(false);
            this.toggleTimer();
          }}/>
      </View>
    );
  },

  render: function() {
    return (
      <View style={{flex:1,backgroundColor:'white'}}>

        <View style={[styles.rowAroundContainer,{flex:2}]}>
          <View style={[styles.rowAroundContainer,{flex:1}]}>
            <TimerText ref={'timer'} remainTime={this.state.remainTime}/>
          </View>
          <View style={{alignItems:'center',justifyContent:'center',paddingHorizontal: 10}}>
           <Text style={{color:SELECT_COLOR,fontSize: 20}}>{'目标数字'}</Text>
           <Text style={{color:SELECT_COLOR,fontSize: 30}}>{this.state.targetNumber}</Text>
          </View>
          <View style={[styles.rowAroundContainer,{flex:1}]}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {this.clearGame();}}>
              <View style={styles.rowAroundContainer}>
                <Text style={[{marginHorizontal:10,fontSize: 13}]}>{'清除'}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{width:SCREEN_WIDTH,height:20,}}>
          <Animated.View style={{width:SCREEN_WIDTH,alignItems:'center',left:this.state.hintLeft.interpolate({inputRange:[0,1],outputRange:[SCREEN_WIDTH,0]})}}>
            <Text style={{fontSize:16,color:SELECT_COLOR}}>{this.state.guessHint || ''}</Text>
          </Animated.View>
        </View>

        <View style={{backgroundColor:'#eeeeee',width:BOARD_WIDTH,flexWrap:'wrap',flexDirection:'row',alignSelf:'center',marginVertical: 5}}>
          {Array.from({length:this.state.totalPieces},(k,v) => {return v;}).map( (v, index) => {
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                key={index}
                style={[styles.outerRect,{
                  width: BOARD_WIDTH / Math.sqrt(this.state.totalPieces),
                  height: BOARD_WIDTH / Math.sqrt(this.state.totalPieces),
                }]}
                onPress={this.onButtonClick.bind(this,index)}>
                <View
                ref={'button' + index}
                style={[styles.innerRect,{
                  // backgroundColor:color,
                  width: BOARD_WIDTH / Math.sqrt(this.state.totalPieces) - 4,
                  height: BOARD_WIDTH / Math.sqrt(this.state.totalPieces) - 4
                }]}>
                  <Text style={{color:'white',fontSize:20,alignSelf:'center'}}>{this.state.allPieceValue[index] || 0}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.rowText}>{'关卡: ' + this.state.round}</Text>
        <Modal
          animated={true}
          animationType={'fade'}
          transparent={true}
          visible={this.state.visible}
          onRequestClose={() => {this.setModalVisible(false);}}>
          <View style={{width:SCREEN_WIDTH,height:SCREEN_HEIGHT,backgroundColor: 'rgba(0,0,0,0.5)',alignItems:'center',justifyContent:'center'}}>
            {this.renderModal()}
          </View>
        </Modal>
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
  innerRect: {
    backgroundColor: MAIN_COLOR,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRect: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowAroundContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  rowText: {
    flex: 1,
    color: '#444444',
    fontSize: 15,
    textAlign: 'center',
    alignSelf: 'center'
  }
});

module.exports = GameContainer;
