import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import ScreenShowData from '../../Screens/StackScreen/ShowData/ScreenShowData';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Root from '../Root/Root';
import ScreenSetting from '../../Screens/StackScreen/Setting/ScreenSetting';
import ScreenChart from '../../Screens/Chart/ScreenChart';
import {Icon} from '@rneui/themed';
import UtilApp from '../../Util/UtilApp';

import PositionScreen = UtilApp.PositionScreen;
import ScreenErrorLog from '../../Screens/ErrorLog/ScreenErrorLog';
import ScreenAbout from '../../Screens/About/ScreenAbout';
import {Alert} from 'react-native';

const Drawer = createDrawerNavigator<Root.Drawer>();

type DrawerNavigationProps = NativeStackScreenProps<
  Root.Stack,
  'ContextActionData'
>;

const DrawerNavigation = ({route}: DrawerNavigationProps) => (
  <Drawer.Navigator initialRouteName={'ShowData'}>
    <Drawer.Screen
      name="ShowData"
      component={ScreenShowData}
      initialParams={route.params}
      options={{
        title: 'Исходные данные',
      }}
    />
    <Drawer.Screen
      name="Chart"
      component={ScreenChart}
      initialParams={{
        position: PositionScreen.Portrait,
      }}
      options={({route: routeChart}) => ({
        title: 'Анализ данных',
        headerShown: routeChart.params.position === PositionScreen.Portrait,
        headerRight: () => (
          <Icon
            color="#007FFF"
            name="devices"
            size={24}
            type="material"
            style={{marginRight: 12, marginTop: 5}}
            onPress={() => {
              Alert.alert(
                '',
                [
                  routeChart.params.labelResult,
                  routeChart.params.topFactorResult,
                ]
                  .filter(it => it !== undefined)
                  .join('\n'),
              );
            }}
          />
        ),
      })}
    />
    <Drawer.Screen
      name="Setting"
      component={ScreenSetting}
      options={{
        title: 'Настройки',
      }}
    />
    <Drawer.Screen
      name="About"
      component={ScreenAbout}
      options={{
        title: 'О программе',
      }}
    />
    <Drawer.Screen
      name="Error"
      component={ScreenErrorLog}
      options={{
        title: 'Логи по ошибкам',
      }}
    />
  </Drawer.Navigator>
);

export default DrawerNavigation;
