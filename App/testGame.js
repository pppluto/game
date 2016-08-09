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
var SCREEN_WIDTH = Dimensions.get('window').width;
var SCREEN_HEIGHT = Dimensions.get('window').height;
var MAIN_COLOR = 'rgb(73,185,251)';
var TOTAL_PIECE = 16; // should be A Perfect Square number

//生成一组参考答案数组。
function createAnswerSequence(a,c){
  var target = parseInt(a || 0, 10);
  var count = parseInt(c || 2, 10);
  if (typeof target !== 'number' || typeof target !== 'number') {
    throw new Error('parameters should be a NUMBER ');
  }
  if (target < 5) {
    throw new Error('target should beyond 5');
  }

  var randomPositions = [], i = 0;
  while (i < count) {
    var tmp = Math.floor(Math.random() * target);
    if (randomPositions.indexOf(tmp) < 0 && tmp !== 0) {
      randomPositions.push(tmp);
      ++i;
    }
  }
  var sortRandomPositions = randomPositions.sort((_a,_b) => _a - _b);
  var targetAnswers = [];
  sortRandomPositions.reduce((p,n) => {
    targetAnswers.push(n - p);
    return n;
  },0);
  targetAnswers.push(target - sortRandomPositions[sortRandomPositions.length - 1]);
  return targetAnswers;
}

function createAllPieceValue(target) {
  var i = 0, arr = [];
  while (i < TOTAL_PIECE) {
    var tmp = Math.floor(Math.random() * 10);
    if (tmp === target) {
      continue;
    }
    arr.push(tmp);
    ++i;
  }
  return arr;
}

function isNearBy(center,b,rowLength) {

  var minus = Math.abs(center - b);
  if (minus !== 1 && minus !== 4 && minus !== 0) {
    return false;
  }

  if (center % rowLength === 0 && b === (center - 1)) {
    return false;
  }

  if (center % rowLength === (rowLength - 1) && b === (center + 1)) {
    return false;
  }

  return true;
}

function getAvailableIndexes(index, rowLength) {
  var allIndexes = [index - rowLength, index + rowLength, index - 1, index + 1];
  var availableIndexes = [];
  allIndexes.forEach( value => {
    if (value >= 0 && value <= (rowLength * rowLength - 1)) {
      if (isNearBy(index, value,rowLength)) {
        availableIndexes.push(value);
      }
    }
  });
  return availableIndexes;
}

function createAnswerIndexes(count){
  var indexesArray = [];
  var rowLength = Math.sqrt(TOTAL_PIECE);

  var initialPosition = Math.floor(Math.random() * TOTAL_PIECE);


  var i = 0;
  var availableIndexes = getAvailableIndexes(initialPosition,rowLength);
  while (i < count) {

    if (indexesArray.indexOf(initialPosition) < 0) {
      indexesArray.push(initialPosition);
      availableIndexes = getAvailableIndexes(initialPosition,rowLength);
      ++i;
    }
    initialPosition = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
  }
  return indexesArray;
}

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
    var answerSequence = createAnswerSequence(targetNumber,count);
    var answerIndexes = createAnswerIndexes(answerSequence.length);
    var allPieceValue = createAllPieceValue(targetNumber);

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
    if (this.state.isOver) {
      return;
    }
    // this.setState({userSelected: [],totalValue:0});
    this.state.userSelected.forEach( v => {
      this.refs['button' + v].setNativeProps({style:{backgroundColor:'white'}});
    });
    this.state.userSelected = [];
    this.state.totalValue = 0;
  },

  showAnswer: function() {
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
    if (isNearBy(centerIndex,index,4)) {
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
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={this.resetGame}>
            <View style={styles.button}>
              <Text style={{color:'white'}}>Reset</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={this.clearGame}>
            <View style={styles.button}>
              <Text style={{color:'white'}}>Clear</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={this.showAnswer}>
            <View style={styles.button}>
              <Text style={{color:'white'}}>Show</Text>
            </View>
          </TouchableOpacity>
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
                style={{borderColor:'rgb(100,100,150)',borderWidth:1,width:SCREEN_WIDTH / 4,height:SCREEN_WIDTH / 4,backgroundColor:color}}>
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.7}
                  style={{width:SCREEN_WIDTH / 4 - 2,height:SCREEN_WIDTH / 4 - 2,justifyContent:'center'}}
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
});

module.exports = TestGame;
