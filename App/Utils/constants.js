import {
  Dimensions,
  PixelRatio
} from 'react-native'

exports.screen = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
};

exports.onePixelHeight = 1 / PixelRatio.get();
