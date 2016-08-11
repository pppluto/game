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
      round: 1,
      currentLevel: 1,
      totalPieces: 16,
    };
  },

  componentDidMount: function() {
    this.resetGame();
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
      userSelected: [],
      totalValue: 0,
      isOver: false,
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
    // this.setState({isOver:false});
    // this.setState({userSelected: [],totalValue:0});
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
      Alert.alert('Warning','you should select adjacent number');
    }

    if (this.state.totalValue === this.state.targetNumber) {

      Alert.alert('Message','Not bad, man!');
      var round = this.state.round;
      var currentLevel = this.state.currentLevel;
      round += 1;
      if (round > 5) {
        round = 1;
        currentLevel += 1;
        if (currentLevel > 3) {
          //game finish
          Alert.alert('Message','You Win!');
          round = 1;
          currentLevel = 1;
        }
      }
      this.setState({round,currentLevel});
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
                key={index + 'value'}
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
        <View style={{flexDirection:'row',justifyContent:'space-around'}}>
          <Text style={{marginBottom:10,fontSize:20,alignSelf:'center'}}>{'Round: ' + this.state.round}</Text>
          <Text style={{marginBottom:10,fontSize:20,alignSelf:'center'}}>{'Level: ' + this.state.currentLevel}</Text>
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

  },
  innerRect: {

    justifyContent: 'center',
  },
});

module.exports = TestGame;
