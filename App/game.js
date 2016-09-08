// var TOTAL_PIECE = 16; // should be A Perfect Square number

//生成一组参考答案数组。
function Game(){
  this.totalPieces = 16;
}

module.exports = Game;

/**
 * [createAnswerSequence 生成参考解]
 * @param  {[type]} a [目标数字]
 * @param  {[type]} c [分成多少部分]
 * @return {[type]}   [返回一组数字数字，相加为目标数字]
 */
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
  var offset = Math.floor(target / (c + 1));
  while (i < count) {
    var tmp = Math.floor(Math.random() * offset) + i * offset;
    if (randomPositions.indexOf(tmp) < 0 && tmp !== 0 && Math.abs(tmp % offset - offset) < 4) {
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
};

/**
 * [createAllPieceValue 随机生成矩阵数字]
 * @param  {[type]} target [目标数字]
 * @param  {[type]} count  [矩阵块数]
 * @return {[type]}        [返回随机数字数组]
 */
Game.prototype.createAllPieceValue = function(target,count) {

  var i = 0, arr = [];
  while (i < this.totalPieces) {
    //target / (count + 1): 在目标数字的小部分中随机值。
    var base = Math.floor(target / (count + 1) + 5);
    var tmp = Math.floor(Math.random() * base);
    if (tmp === target) {
      continue;
    }
    arr.push(tmp);
    ++i;
  }
  return arr;
};

/**
 * [isNearBy 是否相邻]
 * @param  {[type]}  center    [中心位置]
 * @param  {[type]}  b         [给定位置]
 * @param  {[type]}  rowLength [矩阵长度]
 * @return {Boolean}           [是否相邻]
 */
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

/**
 * [getAvailableIndexes 获得可用位置]
 * @param  {[type]} index 所在位置
 * @param  {[type]} rowLength 矩阵长度
 * @param  {[type]} usedIndexes 已占位置
 * @return {[type]} 返回可用位置
 */
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

/**
 * [createAnswerIndexes 生成参考解位置]
 * @param  {[type]} count [多少个位置]
 * @return {[type]}       [返回一个相邻的位置数组]
 */
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

    //没有可用的index，则重新生成.
    if (availableIndexes.length === 0 && i < count) {
      console.log('should recreate answerIndexes, old:',i,indexesArray);
      i = 0;
      indexesArray = [];
      initialPosition = Math.floor(Math.random() * this.totalPieces);
      continue;
    }

    initialPosition = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
  }
  return indexesArray;
}
