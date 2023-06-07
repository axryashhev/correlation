import React, {useCallback, useEffect} from 'react';
import {Button, View} from 'react-native';
import styles from './ScreenData.styles';
import {from, lastValueFrom} from 'rxjs';
import UtilApp from '../../Util/UtilApp';
import {useDataStore} from '../../Stores/DataStore/DataStore';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Root from '../../Navigations/Root/Root';
import notifee from '@notifee/react-native';

type ScreenDataProps = NativeStackScreenProps<Root.Stack, 'Home'>;

const ScreenData = ({navigation}: ScreenDataProps) => {
  const {setJSONData, subjectError$} = useDataStore();

  const handleDocumentSelection = useCallback(() => {
    lastValueFrom(UtilApp.Excel.selectAndFormatDataRx())
      .then(({jsonData, widthArr, data}) => {
        setJSONData(jsonData);
        navigation.navigate('ContextActionData', {
          widthArr,
          data,
        });
      })
      .catch(err => {
        if (err instanceof Error) {
          subjectError$.next(err.message);
        }
      });
  }, [navigation, setJSONData, subjectError$]);

  const navigateLogError = useCallback(() => {
    navigation.navigate('Error');
  }, [navigation]);

  useEffect(() => {
    const subscription$ = from(notifee.requestPermission()).subscribe(() => {});
    return () => subscription$.unsubscribe();
  }, []);

  return (
    <View style={[{flex: 1}, styles.container]}>
      <Button title="Select 📑" onPress={handleDocumentSelection} />
      <View style={{height: 20}} />
      <Button title="Логи по ошибкам" onPress={navigateLogError} />
    </View>
  );
};
export default ScreenData;
