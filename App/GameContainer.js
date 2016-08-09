var React = require('react');
var ReactNative = require('react-native');
var {
  View,
  Text,
  Alert,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  TouchableOpacity
} = ReactNative;
var Game = require('./Game');
var SCREEN_WIDTH = Dimensions.get('window').width;
var SCREEN_HEIGHT = Dimensions.get('window').height;
var MAIN_COLOR = 'rgb(73,185,251)';

var TestGame = React.createClass({

  statics:{
    title: 'TestGame',
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
      round: 0,
    };
  },

  componentDidMount: function() {
    this.resetGame();
  },

  resetGame: function() {
    var targetNumber = Math.floor(Math.random() * (10 + this.state.round * 2)) + 6;
    var count = this.state.round < 3 ? 1 : (this.state.round < 6 ? 2 : 3);
    var answerSequence = Game.createAnswerSequence(targetNumber,count);
    var answerIndexes = Game.createAnswerIndexes(answerSequence.length);
    var allPieceValue = Game.createAllPieceValue(targetNumber);

    answerIndexes.forEach( (index,i_index) => {
      allPieceValue[index] = answerSequence[i_index];
    });
    this.setState({
      targetNumber,
      allPieceValue,
      answerIndexes,
      userSelected: [],
      totalValue: 0,
      isOver: false,
    });
  },

  clearGame: function() {
    this.state.userSelected.forEach( v => {
      this.refs['button' + v].setNativeProps({style:{backgroundColor:'white'}});
    });
    this.state.userSelected = [];
    this.state.totalValue = 0;
    this.setState({isOver:false});
    // this.setState({userSelected: [],totalValue:0});
  },

  showAnswer: function() {
    this.clearGame();
    this.setState({isOver:true});
  },

  onButtonClick: function(index) {
    if (this.state.isOver) {
      return;
    }

    if (this.state.userSelected.indexOf(index) >= 0 ) {
      return;
    }
    var userSelected = this.state.userSelected;
    var centerIndex = userSelected.length ? userSelected[userSelected.length - 1] : index;
    if (Game.isNearBy(centerIndex,index,4)) {
      userSelected.push(index);
      this.state.totalValue = this.state.totalValue + this.state.allPieceValue[index];
      // this.setState({userSelected});
      this.refs['button' + index].setNativeProps({style:{backgroundColor:MAIN_COLOR}});
      this.state.userSelected = userSelected;
    } else {
      Alert.alert('Warning','you should select adjacent number');
    }

    if (this.state.totalValue === this.state.targetNumber) {

      Alert.alert('Message','Not bad, man!');
      this.setState({round: this.state.round + 1});
      setTimeout(() => {
        this.resetGame();
      }, 1000);
    }
  },

  render: function() {
    return (
      <View style={{flex:1,width:SCREEN_WIDTH,height:SCREEN_HEIGHT}}>
        <StatusBar backgroundColor="blue" barStyle="light-content" />
        <View style={{width:SCREEN_WIDTH,height: 50, justifyContent:'center',backgroundColor:MAIN_COLOR}}>
          <Text style={{fontSize:20,alignSelf:'center',color:'white'}}>{'Target Number: ' + this.state.targetNumber}</Text>
        </View>
        <View style={{flexDirection:'row',justifyContent:'space-around',marginVertical: 15}}>
          {Array.from({length:3}, v => v).map( (value, index) => {
            var text = ['Reset', 'Clear', 'Show'][index];
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  switch (index) {
                    case 0:
                      return this.resetGame();
                    case 1:
                      return this.clearGame();
                    case 2:
                      return this.showAnswer();
                    default:
                      return;
                  }
                }}>
                <View style={styles.button}>
                  <Text style={{color:'white'}}>{text}</Text>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
        <Text style={{marginBottom:10,fontSize:20,alignSelf:'center'}}>{'Rounds: ' + this.state.round}</Text>
        <View style={{width:SCREEN_WIDTH,flexWrap:'wrap',flexDirection:'row'}}>
          {Array.from({length:16},(k,v) => {return v;}).map( (v, index) => {
            var highlightIndexes = this.state.isOver ? this.state.answerIndexes : this.state.userSelected;
            var color = highlightIndexes.indexOf(index) >= 0 ? MAIN_COLOR : 'white';
            return (
              <View
                key={index}
                ref={'button' + index}
                style={[styles.rect,{backgroundColor:color}]}>
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.7}
                  style={styles.innerRect}
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
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: MAIN_COLOR,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rect: {
    borderColor: 'rgb(100,100,150)',
    borderWidth: 1,
    width: SCREEN_WIDTH / 4,
    height: SCREEN_WIDTH / 4,
  },
  innerRect: {
    width: SCREEN_WIDTH / 4 - 4,
    height: SCREEN_WIDTH / 4 - 4,
    justifyContent: 'center',
  },
});

module.exports = TestGame;
