import React, {useCallback, useMemo} from 'react';
import {Platform, StyleSheet, Text} from 'react-native';

import {Dropdown} from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {ChartData, useDataStore} from '../../../Stores/DataStore/DataStore';
import {observer} from 'mobx-react';
import useSafeAreaApp from '../../../Hooks/useSafeAreaApp';
import {SafeAreaView} from 'react-native-safe-area-context';
import UtilApp from '../../../Util/UtilApp';
import DataExcel = UtilApp.Excel.DataExcel;

type Item = {label: string; value: string};

const choice: Array<Item> = [
  {label: 'Линейный', value: 'linear'},
  {label: 'Пузырьковый', value: 'bubble'},
  {label: 'Рассеивающий', value: 'scatter'},
];

const ScreenSetting = observer(() => {
  const {
    setTypeChartCorrelation,
    setTypeChartData,
    typeChartData,
    typeChartCorrelation,
    topFactor,
    setTopFactor,
    jsonData,
  } = useDataStore();

  const choiceTop = useMemo(
    () =>
      Object.keys(jsonData!).map(it => ({
        label: String(it),
        value: String(it),
      })),
    [jsonData],
  );

  const {renderEdges} = useSafeAreaApp();

  const onChangeData = useCallback(
    (item: Item) => {
      setTypeChartData(item.value as ChartData);
    },
    [setTypeChartData],
  );

  const onChangeCorrelation = useCallback(
    (item: Item) => {
      setTypeChartCorrelation(item.value as ChartData);
    },
    [setTypeChartCorrelation],
  );

  const renderRightIcon = () => (
    <Icon
      name={'unfold-more-horizontal'}
      size={24}
      style={{marginRight: -20}}
    />
  );

  return (
    <SafeAreaView style={{flex: 1}} edges={renderEdges}>
      <Text style={{marginLeft: 10, marginTop: 10, color: 'black'}}>
        Тип графика данных:
      </Text>
      <Dropdown
        placeholder={'Выберите тип графика'}
        data={choice}
        labelField={'label'}
        valueField={'value'}
        style={PickerSelectStylesNew.container}
        itemTextStyle={{color: 'black'}}
        selectedTextStyle={{color: 'black'}}
        onChange={onChangeData}
        value={typeChartData}
        renderRightIcon={renderRightIcon}
      />

      <Text style={{marginLeft: 10, marginTop: 10, color: 'black'}}>
        Тип графика корреляции:
      </Text>
      <Dropdown
        placeholder={'Выберите тип графика'}
        data={choice}
        labelField={'label'}
        valueField={'value'}
        itemTextStyle={{color: 'black'}}
        selectedTextStyle={{color: 'black'}}
        style={PickerSelectStylesNew.container}
        onChange={onChangeCorrelation}
        value={typeChartCorrelation}
        renderRightIcon={renderRightIcon}
      />

      <Text style={{marginLeft: 10, marginTop: 10, color: 'black'}}>
        Топ для параметра:
      </Text>
      <Dropdown
        placeholder={'Выберите топ фактор'}
        placeholderStyle={{color: 'black'}}
        data={choiceTop}
        labelField={'label'}
        valueField={'value'}
        itemTextStyle={{color: 'black'}}
        selectedTextStyle={{color: 'black'}}
        style={PickerSelectStylesNew.container}
        onChange={it => setTopFactor(it.value as keyof DataExcel)}
        // @ts-ignore
        value={topFactor}
        renderRightIcon={renderRightIcon}
      />
    </SafeAreaView>
  );
});

const PickerSelectStylesNew = StyleSheet.create({
  container: Platform.select({
    ios: {
      fontSize: 16,
      paddingVertical: 12,
      margin: 10,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: 'rgba(221, 221, 221, 1)',
      borderRadius: 4,
      color: 'black',
      paddingRight: 30, // to ensure the text is never behind the icon}
    },
    android: {
      fontSize: 16,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: 'rgba(221, 221, 221, 1)',
      borderRadius: 8,
      color: 'black',
      paddingRight: 30, // to ensure the text is never behind the icon
    },
  })!,
});

export default ScreenSetting;
