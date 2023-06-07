import 'react-native-gesture-handler';
import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import ScreenData from './src/Screens/Data/ScreenData';
import {observer} from 'mobx-react';
// import ScreenChart from './src/Screens/Chart/ScreenChart';
import DrawerNavigation from './src/Navigations/Drawer/DrawerNavigation';
import Root from './src/Navigations/Root/Root';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {useDataStore} from './src/Stores/DataStore/DataStore';
import storage, {KeyStorage} from './src/Storage/storage';
import ScreenErrorLog from './src/Screens/ErrorLog/ScreenErrorLog';

const Stack = createNativeStackNavigator<Root.Stack>();

const App = observer(() => {
  // const {jsonData} = useDataStore();
  const {subjectError$} = useDataStore();

  // <ViewVisible condition={jsonData !== undefined}>
  //     <Icon color="#0CC" name="devices" size={40} type="material" />
  // </ViewVisible>

  useEffect(() => {
    const subscription$ = subjectError$.subscribe(it => {
      storage.set(
        KeyStorage.LOG_ERROR,
        (storage.getString(KeyStorage.LOG_ERROR) ?? '') + it + '\n\r',
      );
    });

    return () => subscription$.unsubscribe();
  }, [subjectError$]);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {/*<Stack.Screen*/}
          {/*  name="Test"*/}
          {/*  component={ExampleThree}*/}
          {/*  options={{headerShown: false}}*/}
          {/*/>*/}
          <Stack.Screen
            name="Home"
            component={ScreenData}
            options={{
              title: 'Домашняя страница',
              // headerRight: () => (
              //   <Icon
              //     color="#0CC"
              //     name="bar-chart-outline"
              //     size={28}
              //     type="ionicon"
              //     onPress={() => navigation.navigate('Chart')}
              //   />
              // ),
            }}
          />
          <Stack.Screen
            name="Error"
            component={ScreenErrorLog}
            options={{title: 'Логи по ошибкам'}}
          />
          <Stack.Screen
            name="ContextActionData"
            component={DrawerNavigation}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
});

export default App;
