import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Platform, Text, View} from 'react-native';
import {useDataStore} from '../../Stores/DataStore/DataStore';
import styles from './ScreenChart.styles';
import {
  BubbleData,
  BubbleDataset,
  LineData,
  LineDataset,
  ScatterData,
  ScatterDataset,
} from 'react-native-charts-wrapper';
import UtilCorrelation from '../../Util/Correlation/Correlation';
import MultiSelectView from './components/MultiSelectView/MultiSelectView';
import ToastData from './components/ToastData/ToastData';
import Toast from 'react-native-easy-toast';
import {
  forkJoin,
  from,
  lastValueFrom,
  map,
  of,
  Subject,
  switchMap,
  take,
  toArray,
} from 'rxjs';
import {
  convertArrayStringToArrayInt,
  getDataChartCorrelationRx,
  getDataChartShowRx,
  getDataRx,
  getFormatDate,
  getLabel,
  getNumbersJSONData,
  ItemSelectCorrelation,
  takeScreenShotRx,
} from './ScreenChart.util';
import useSafeAreaApp from '../../Hooks/useSafeAreaApp';
import {SafeAreaView} from 'react-native-safe-area-context';

import UtilApp from '../../Util/UtilApp';
import {Button} from '@rneui/themed';
import XLSX, {utils} from 'xlsx';
import RNFetchBlob from 'react-native-blob-util';
import ChartView from './components/ChartView/ChartView';
import ViewVisible from '../../HOC/ViewVisible/ViewVisible';
import {observer} from 'mobx-react';
import ViewShot from 'react-native-view-shot';
import useScreenOrientation from '../../Hooks/useScreenOrientation';
import {DrawerScreenProps} from '@react-navigation/drawer';
import Root from '../../Navigations/Root/Root';

import ViewDataExcel = UtilApp.Excel.ViewDataExcel;
import ValueViewDataExcel = UtilApp.Excel.ValueViewDataExcel;
import PositionScreen = UtilApp.PositionScreen;

type ScreenChartProps = DrawerScreenProps<Root.Drawer, 'Chart'>;

const ScreenChart = observer(({navigation}: ScreenChartProps) => {
  const view_shot_ref1 = useRef<ViewShot | null>(null);
  const view_shot_ref2 = useRef<ViewShot | null>(null);
  const {
    jsonData,
    subjectError$,
    typeChartData,
    typeChartCorrelation,
    topFactor,
  } = useDataStore();

  const subjectErrorData$ = useRef(new Subject<UtilApp.Excel.DataException>());

  const {subjectDetectOrientation$, onLayoutHandle, positionScreen} =
    useScreenOrientation();

  // const {width, height} = useWindowDimensions();
  const {renderChart} = useSafeAreaApp(positionScreen);
  const toast = useRef<Toast>(null);
  const [selectData, setSelectData] = useState<Array<ItemSelectCorrelation>>(
    [],
  );
  // const [selectCorrelation, setSelectCorrelation] = useState<Array<string>>([]);
  const [resultCorrelation, setResultCorrelation] = useState<number>(-1);
  // const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const [showChartData, setShowChartData] = useState<
    ScatterData | LineData | BubbleData | undefined
  >();
  const [correlationChartData, setCorrelationChartData] = useState<
    ScatterData | LineData | BubbleData | undefined
  >();
  const [labelResult, setLabelResult] = useState<string | undefined>();

  const updateCorrelation = useCallback(
    (value: Array<ValueViewDataExcel>) => {
      if (jsonData === undefined) {
        return;
      }

      const [x, y] = value.map(it => convertArrayStringToArrayInt(it.data));

      const result = UtilCorrelation.correlation(x, y);

      const correlation =
        typeof result === 'string' ? parseFloat(result) : result;

      setLabelResult(
        `Поле [${getLabel(value[0])}] ${
          correlation < 0 ? 'обратно-' : 'прямо-'
        }пропорциональна полю [${getLabel(value[1])}]`,
      );

      setResultCorrelation(correlation);
    },
    [jsonData],
  );

  const updateDataSets = useCallback(
    (select: Array<ValueViewDataExcel>) => {
      if (!jsonData || select.length !== 2) {
        return;
      }

      const [x, y] = select.map(it => convertArrayStringToArrayInt(it.data));

      lastValueFrom(
        forkJoin([
          getDataChartShowRx(select).pipe(toArray()),
          getDataChartCorrelationRx(x, y).pipe(toArray()),
        ]),
      ).then(([chartData, correlationData]) => {
        // console.log('tes: ', correlationData);
        setShowChartData({
          dataSets: chartData,
        });
        setCorrelationChartData({
          dataSets: correlationData,
        });
      });
    },
    [jsonData, setShowChartData],
  );

  const exportFile = () => {
    if (
      showChartData?.dataSets === undefined ||
      correlationChartData?.dataSets === undefined
    ) {
      return;
    }

    const dataShow$ = getDataRx(showChartData.dataSets);

    const dataCorrelation$ = getDataRx(
      (
        correlationChartData.dataSets as Array<
          ScatterDataset | LineDataset | BubbleDataset
        >
      ).filter(
        it =>
          'values' in it &&
          !!it.values &&
          Array.isArray(it.values) &&
          it.values.length !== 0,
      ),
    );

    lastValueFrom(
      forkJoin([
        takeScreenShotRx(view_shot_ref1.current!),
        takeScreenShotRx(view_shot_ref2.current!),
      ]).pipe(
        switchMap(() =>
          forkJoin([dataShow$, dataCorrelation$]).pipe(
            // Array<string>, Array<Array<number>>
            map(([data, correlation]) => [data, correlation].flat()),
            switchMap(data => {
              const ws = utils.aoa_to_sheet(data);
              //
              //   /* build new workbook */=
              const wb = utils.book_new();
              utils.book_append_sheet(wb, ws, 'Иследование');

              const wbout = XLSX.write(wb, {type: 'buffer', bookType: 'xlsx'});
              const file = RNFetchBlob.fs.dirs.DocumentDir + '/study.xlsx';

              return from(
                RNFetchBlob.fs.writeFile(file, Array.from(wbout), 'ascii'),
              ).pipe(map(() => file));
            }),
          ),
        ),
      ),
    ).then(path => {
      if (Platform.OS === 'ios') {
        RNFetchBlob.ios.presentPreview(path);
      } else {
        RNFetchBlob.android
          .actionViewIntent(
            path,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          )
          .then(() => {});
      }
    });
  };

  // useEffect(() => {
  //   if (!jsonData || !topFactor) {
  //     return;
  //   }
  //
  //   const numbersJSONData$ = of(
  //     getNumbersJSONData(jsonData, subjectErrorData$.current),
  //   );
  //
  //   numbersJSONData$.pipe(map(it => Object.keys(it).find(item => it === to)))
  //
  //
  // }, [jsonData, topFactor]);

  useEffect(() => {
    const subscription$ = subjectDetectOrientation$.current.subscribe(pos => {
      navigation.setParams({position: pos});
    });

    return () => subscription$.unsubscribe();
  }, [navigation, subjectDetectOrientation$]);

  useEffect(() => {
    const subscription$ = subjectErrorData$.current.subscribe(it => {
      subjectError$.next(
        `${getFormatDate(
          new Date(Date.now()),
        )} Ошибка при парсинге данных в ключе (${it.name}) ${
          it.item ? 'в поле: ' + it.item : ''
        }`,
      );
    });

    return () => subscription$.unsubscribe();
  }, [subjectError$]);

  useEffect(() => {
    if (!jsonData) {
      return;
    }

    const subscription$ = of(
      getNumbersJSONData(jsonData, subjectErrorData$.current),
    )
      .pipe(
        switchMap(numbersJSONData =>
          from(Object.values(numbersJSONData)).pipe(
            take(2),
            toArray(),
            map(select => ({
              data: Object.entries(numbersJSONData).map(([key, value]) => ({
                label: key as keyof ViewDataExcel,
                value: value,
              })),
              select,
            })),
          ),
        ),
      )
      .subscribe(({select, data}) => {
        setSelectData(data);
        updateCorrelation(select);
        updateDataSets(select);
      });

    return () => subscription$.unsubscribe();
  }, [jsonData, subjectError$, updateCorrelation, updateDataSets]);

  const onEmitMessageError = (message: string) => {
    toast.current?.show(message, 500);
  };

  const onEmitData = useCallback(
    (emitData: Array<unknown> | string) => {
      if (typeof emitData === 'string') {
        onEmitMessageError(emitData);
        // setErrorMessage(emitData);
        return;
      }
      // setErrorMessage(undefined);
      updateCorrelation(emitData as Array<ValueViewDataExcel>);
      updateDataSets(emitData as Array<ValueViewDataExcel>);
    },
    [updateCorrelation, updateDataSets],
  );

  // console.log('typeChartData: ', typeChartData);
  const renderColorCorrelation = useMemo(
    () => (resultCorrelation < 0 ? 'red' : 'green'),
    [resultCorrelation],
  );

  return (
    <SafeAreaView
      style={styles.container}
      edges={renderChart}
      onLayout={onLayoutHandle}>
      <ToastData ref={toast} isLandscape={false} />
      <ViewVisible condition={positionScreen === PositionScreen.Portrait}>
        <MultiSelectView
          data={selectData}
          onEmitData={onEmitData}
          onEmitMessageError={onEmitMessageError}
        />
        <Text
          style={{
            color: renderColorCorrelation,
            marginTop: 10,
            marginLeft: 10,
          }}>
          {`Корреляция: ${resultCorrelation}`}
        </Text>
      </ViewVisible>
      {/*<ViewVisible condition={errorMessage !== undefined}>*/}
      {/*  <Text style={{color: 'red'}}>{errorMessage}</Text>*/}
      {/*</ViewVisible>*/}
      <View style={{flex: 1}}>
        <ViewShot
          ref={view_shot_ref1}
          options={{fileName: 'photo'}}
          style={{
            flex: 0.5,
            backgroundColor: '#FFFFFF',
            marginTop: positionScreen === PositionScreen.Portrait ? 0 : 7,
          }}>
          <ViewVisible condition={showChartData !== undefined}>
            <ChartView type={typeChartData} data={showChartData!} />
          </ViewVisible>
        </ViewShot>
        <ViewShot
          ref={view_shot_ref2}
          options={{fileName: 'photo'}}
          style={{flex: 0.5, backgroundColor: '#FFFFFF'}}>
          <ViewVisible condition={showChartData !== undefined}>
            <ChartView
              type={typeChartCorrelation}
              data={correlationChartData!}
            />
          </ViewVisible>
        </ViewShot>
      </View>
      <ViewVisible condition={positionScreen === PositionScreen.Portrait}>
        <ViewVisible condition={labelResult !== undefined}>
          <Text
            style={{
              marginHorizontal: 2,
              textAlign: 'center',
              color: renderColorCorrelation,
            }}>
            {labelResult}
          </Text>
        </ViewVisible>
        <Button
          title={'Сохранить'}
          style={{marginBottom: 16, width: '80%'}}
          containerStyle={{alignItems: 'center', borderRadius: 10}}
          onPress={exportFile}
        />
      </ViewVisible>
    </SafeAreaView>
  );
});

export default ScreenChart;
