import {Dimensions, StyleSheet} from 'react-native';

const heightScreen = Dimensions.get('screen').height;
export default StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {fontSize: 20, textAlign: 'center', margin: 10},
  bolded: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  thead: {height: 40, backgroundColor: 'red'},
  tr: {height: 30, backgroundColor: 'blue'},
  text: {marginLeft: 5},
  table: {width: '100%'},
  image: {height: 16, width: 16},
  safeArea: {
    flex: 1,
    height: heightScreen,
    justifyContent: 'center',
    backgroundColor: 'white',
    alignItems: 'center',
  },
});
