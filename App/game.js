// var TOTAL_PIECE = 16; // should be A Perfect Square number

//生成一组参考答案数组。
function Game(){
  this.totalPieces = 16;
}

module.exports = Game;

Game.prototype.createAnswerSequence = function(a,c){
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

Game.prototype.createAllPieceValue = function(target,totalPieces) {

  var i = 0, arr = [];
  while (i < this.totalPieces) {
    var tmp = Math.floor(Math.random() * 20);
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
  if (minus !== 1 && minus !== rowLength && minus !== 0) {
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

Game.prototype.isNearBy = isNearBy;

function getAvailableIndexes(index, rowLength, usedIndexesArray) {
  var allIndexes = [index - rowLength, index + rowLength, index - 1, index + 1];
  var availableIndexes = [];
  var usedIndexes = usedIndexesArray || [];
  allIndexes.forEach( value => {
    if (value >= 0 && value < rowLength * rowLength) {
      if (isNearBy(index, value,rowLength) && usedIndexes.indexOf(value) < 0) {
        availableIndexes.push(value);
      }
    }
  });
  return availableIndexes;
}

Game.prototype.createAnswerIndexes = function(count){
  var indexesArray = [];
  var rowLength = Math.sqrt(this.totalPieces);

  var initialPosition = Math.floor(Math.random() * this.totalPieces);

  var i = 0;
  var availableIndexes = getAvailableIndexes(initialPosition,rowLength);
  while (i < count) {

    if (indexesArray.indexOf(initialPosition) < 0) {
      indexesArray.push(initialPosition);
      availableIndexes = getAvailableIndexes(initialPosition,rowLength,indexesArray);
      ++i;
    }

    //没有可用的index(四个角上)，则重新生成.
    if (availableIndexes.length === 0 && i < count) {
      i = 0;
      indexesArray = [];
      initialPosition = Math.floor(Math.random() * this.totalPieces);
      continue;
    }

    initialPosition = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
  }
  return indexesArray;
}
