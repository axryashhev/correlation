import UtilApp from '../../Util/UtilApp';
import {
  catchError,
  concatMap,
  first,
  forkJoin,
  from,
  last,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  toArray,
} from 'rxjs';
import {Alert, processColor} from 'react-native';
import {
  BubbleDataset,
  LineDataset,
  LineValue,
  ScatterDataset,
} from 'react-native-charts-wrapper';
import Regression from '../../Util/Regression/Regression';
import ViewShot from 'react-native-view-shot';
import notifee, {
  AndroidImportance,
  AndroidVisibility,
} from '@notifee/react-native';
import {checkPermissionRx, noPermission} from '../../Util/UtilCheck';
import {RESULTS} from 'react-native-permissions';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';

import DataExcel = UtilApp.Excel.DataExcel;
import ViewDataExcel = UtilApp.Excel.ViewDataExcel;
import DataException = UtilApp.Excel.DataException;
import ValueViewDataExcel = UtilApp.Excel.ValueViewDataExcel;

export type ItemSelectCorrelation = {
  label: keyof DataExcel;
  value: ValueViewDataExcel;
};

export function convertArrayStringToArrayInt(source: Array<number | string>) {
  return source.map(it =>
    typeof it === 'number' ? it : parseFloat(it.match(/(\d+)/)![0]),
  ) as Array<number>;
}

function checkValueNumbers(value: Array<string>) {
  return value.find(item => item.match(/(\d+)/) === null);
}

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

// toLowerCase ALL!!!
function checkDataArrayEnum(source: Array<string>) {
  const it2 = source.find(it => it !== source[0]);

  const data = [
    source[0],
    it2,
    source.find(it => it !== source[0] && it !== it2),
  ].filter(notEmpty);

  const sizeCheckData = data.reduce((acc, value) => {
    acc += source.filter(it => it === value).length;
    return acc;
  }, 0);

  return sizeCheckData === source.length ? data : undefined;
}

function getValueNumbers(
  key: keyof ViewDataExcel,
  data: Array<string>,
  value: Array<number | string>,
  subjectError$: Subject<DataException>,
) {
  const check = checkValueNumbers(data);

  if (check) {
    subjectError$.next({name: key, item: check});
    return undefined;
  }
  return {
    label: key,
    data: value,
  } as ValueViewDataExcel;
}

function getDataArrayEnum(
  key: keyof ViewDataExcel,
  data: Array<string>,
  value: Array<string>,
  subjectError$: Subject<DataException>,
) {
  const check = checkDataArrayEnum(data);

  if (!check) {
    subjectError$.next({name: key, item: check});
    return undefined;
  }

  return {
    keys: check,
    data: getDataEnum(getRecordEnum(check), value),
  };
}

function getRecordEnum(keys: Array<string>) {
  return keys.reduce((acc: Record<string, number>, value, index) => {
    acc[value] = index;
    return acc;
  }, {});
}

function getDataEnum(recordEnum: Record<string, number>, value: Array<string>) {
  return value.map(it => recordEnum[it]);
}

export function getNumbersJSONData(
  source: DataExcel,
  subjectError$: Subject<DataException>,
): ViewDataExcel {
  return Object.entries(source).reduce((acc: ViewDataExcel, [key, value]) => {
    const data = value.map(it => String(it).toLowerCase());

    const [result] = [
      getValueNumbers(key as keyof DataExcel, data, value, subjectError$),
      getDataArrayEnum(key as keyof DataExcel, data, data, subjectError$),
    ].filter(notEmpty);

    if (result) {
      acc[key] = result;
    }

    return acc;
  }, {});
}

export function getFormatDate(date: Date) {
  const t1 = [date.getDate(), date.getMonth() + 1, date.getFullYear()]
    .map(it => (it < 10 ? '0' + it : it))
    .join('.');

  const t2 = [date.getHours(), date.getMinutes()]
    .map(it => (it < 10 ? '0' + it : it))
    .join(':');

  return `${t1} ${t2}`;
}

export function getKeysData(select: ValueViewDataExcel) {
  const keys = select.keys;

  return keys !== undefined
    ? keys.map((it, index) => `${index}-${it}`).join(', ')
    : select.label!;
}

function getColor(index: number) {
  switch (index) {
    case 0:
      return 'gray';
    case 1:
      return 'red';
    case 2:
      return 'blue';
    case 3:
      return 'green';
    case 4:
      return 'pink';
    case 5:
      return 'yellow';
    default:
      return 'orange';
  }
}

export function getDataChartShowRx(select: Array<ValueViewDataExcel>) {
  return from(select).pipe(
    map((it, index) => ({
      key: getKeysData(it),
      values: convertArrayStringToArrayInt(it.data),
      color: getColor(index),
    })),
    map(({key, values, color}) => ({
      values: values.map((it, index) => ({
        x: index,
        y: it,
        size: it,
      })),
      label: key,
      config: {
        circleColor: processColor(color),
        valueTextColor: processColor('black'),
        color: processColor(color),
        scatterShape: 'X',
      },
    })),
  );
}

// correlationStream$.pipe(
//     filter(it => it.values.length !== 0),
//     concatMap(it => {
//       const last$ = from(it.values).pipe(last());
//       const first$ = from(it.values).pipe(first());
//       return forkJoin([first$, last$]).pipe(
//           map(([firstLocal, lastLocal]) =>
//               firstLocal.y < lastLocal.y ? 'позитивная' : 'отрицательная',
//           ),
//       );
//     }),
// );

function getLabelRx(
  values: Array<{x: number; y: number; size: number}>,
): Observable<string | undefined> {
  const last$ = from(values).pipe(last());
  const first$ = from(values).pipe(first());

  return values.length === 0
    ? of(undefined)
    : forkJoin([first$, last$]).pipe(
        map(([firstLocal, lastLocal]) =>
          firstLocal.y < lastLocal.y ? 'позитивная' : 'отрицательная',
        ),
      );
}

export function getDataChartCorrelationRx(x: Array<number>, y: Array<number>) {
  return from([
    {label: 'Полиномиальная: ', data: Regression.polynomial([x, y])},
    {label: 'Линейная: ', data: Regression.linear([x, y])},
    {label: 'Экспоненциальная: ', data: Regression.exponential([x, y])},
    {label: 'Логарифмическая: ', data: Regression.logarithmic([x, y])},
    {label: 'Силовая: ', data: Regression.power([x, y])},
  ]).pipe(
    concatMap((regression, index) => {
      const values = x.reduce(
        (
          acc: Array<{
            x: number;
            y: number;
            size: number;
          }>,
          _,
          i,
        ) => {
          const [localX, localY] = regression.data.predict(i);
          if (!isNaN(localY) && isFinite(localY)) {
            acc.push({
              x: localX,
              y: localY,
              size: localY,
            });
          }
          return acc;
        },
        [],
      );

      return getLabelRx(values).pipe(
        map(
          it =>
            `${regression.label} (${regression.data.string}) r2=${
              regression.data.r2
            } ${it ? `(${it})` : ''}`,
        ),
        map(label => ({
          values,
          label,
          config: {
            circleColor: processColor(getColor(index)),
            valueTextColor: processColor('black'),
            color: processColor(getColor(index)),
            scatterShape: 'X',
          },
        })),
      );
    }),
  );
}

function generateData(source: Array<Array<LineValue | number>>, index: number) {
  let item: Array<number | string> = [];
  for (let i = 0; i < source.length; i++) {
    item.push(checkData(source[i][index]));
  }
  return item;
}

function getValueDataRx(source: Array<Array<LineValue | number>>) {
  return new Observable<Array<number | string>>(subscriber => {
    for (let i = 0; i < getMaxSize(source); i++) {
      subscriber.next(generateData(source, i));
    }
    subscriber.complete();
  });
}

function getMergeData(
  key: Array<string>,
  value: Array<Array<number | string>>,
) {
  const result: Array<Array<string | number>> = [key];
  for (let valueElement of value) {
    result.push(valueElement);
  }
  result.push(result[0].map(() => ''));
  return result;
}

function checkData(item: number | LineValue | undefined) {
  return typeof item === 'number' ? item : item ? item.y : '';
}

function getMaxSize(data: Array<Array<unknown>>) {
  if (data.length === 0) {
    return 0;
  }
  let minSize = 0;
  for (let datum of data) {
    if (minSize < datum.length) {
      minSize = datum.length;
    }
  }

  return minSize;
}

export function getDataRx(
  dataSets: Array<ScatterDataset> | Array<LineDataset> | Array<BubbleDataset>,
) {
  const keys$ = from(dataSets).pipe(
    map(it => it.label!),
    toArray(),
  );
  // console.log('testgf4g: ', dataSets.map(it => it.values).length);
  // const [val1, val2] = dataSets.map(it => it.values);

  const values$ = getValueDataRx(dataSets.map(it => it.values!)).pipe(
    toArray(),
  );

  // values$.subscribe(it => {
  //   console.log('testgegdt: ', it);
  // });

  return forkJoin([keys$, values$]).pipe(
    map(([key, value]) => getMergeData(key, value)),
  );
}

export function saveAndNotifyPhotoRx(obj: string) {
  return from(CameraRoll.save(obj, {type: 'photo'})).pipe(() =>
    from(
      notifee.createChannel({
        id: 'mediateka',
        name: 'Сохранение скриншотов',
        vibration: true,
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
      }),
    ).pipe(
      switchMap(channelId =>
        from(
          notifee.displayNotification({
            title: 'Результат иследования',
            body: 'Результат иследования успешно был загружен и добавлен в медиатеку',
            android: {
              channelId: channelId,
            },
          }),
        ),
      ),
    ),
  );
}

export function takeScreenShotRx(view_shot_ref: ViewShot) {
  return checkPermissionRx().pipe(
    switchMap(result => {
      if (!view_shot_ref || !view_shot_ref.capture) {
        // Ref view shot not found
        throw 'SystemError';
      }

      if (typeof result === 'boolean' && result) {
        return from(view_shot_ref.capture!());
      }

      switch (result) {
        case RESULTS.GRANTED:
        case RESULTS.UNAVAILABLE:
          return from(view_shot_ref.capture!());
      }
      throw 'NoPermission';
    }),
    switchMap(saveAndNotifyPhotoRx),
    catchError(err => {
      if (typeof err === 'string' && err !== 'SystemError') {
        err === 'NoPermission' ? noPermission() : Alert.alert('', err);
      }
      return of(undefined);
    }),
  );
}

export function getLabel(value: ValueViewDataExcel) {
  return value.label
    ? value.label
    : value.keys!.map((it, index) => `${index} - ${it}`);
}
