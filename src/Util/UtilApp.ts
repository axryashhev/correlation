import {
  concatMap,
  forkJoin,
  from,
  map,
  of,
  reduce,
  switchMap,
  toArray,
} from 'rxjs';
import DocumentPicker, {types} from 'react-native-document-picker';
import RNFetchBlob from 'react-native-blob-util';
import XLSX from 'xlsx';
import {Platform} from 'react-native';

namespace UtilApp {
  export enum PositionScreen {
    Portrait = 'PORTRAIT',
    Landscape = 'LANDSCAPE',
  }

  export namespace Excel {
    export type ValueViewDataExcel = {
      label?: string;
      data: Array<string | number>;
      keys?: Array<string>;
    };
    export type ViewDataExcel = Record<string | number, ValueViewDataExcel>;
    export type DataExcel = Record<string | number, Array<string | number>>;
    export type DataException = {
      name: keyof DataExcel;
      item?: string;
    };
    function make_width(ws: XLSX.WorkSheet) {
      const aoa: Array<Array<number>> = XLSX.utils.sheet_to_json(ws, {
          header: 1,
        }),
        res: Array<number> = [];
      aoa.forEach(r => {
        r.forEach((c, C) => {
          res[C] = Math.max(res[C] ?? 60, String(c).length * 10);
        });
      });
      for (let C = 0; C < res.length; ++C) {
        if (!res[C]) {
          res[C] = 60;
        }
      }
      return res;
    }

    function getValueRx(
      source: Array<Array<number> | Array<string>>,
      index: number,
    ) {
      return from(source).pipe(map(it => it[index]));
    }

    function getJSONDataRx(data: Array<Array<number> | Array<string>>) {
      const keys = data[0];
      const values = data.slice(1);

      return from(keys).pipe(
        concatMap((key, index) =>
          forkJoin([of(key), getValueRx(values, index).pipe(toArray())]),
        ),
        reduce(
          (
            accum: Record<string | number, Array<string | number>>,
            [key, value],
          ) => {
            accum[key] = value;
            return accum;
          },
          {},
        ),
      );
    }

    export function selectAndFormatDataRx() {
      return from(
        DocumentPicker.pickSingle({
          presentationStyle: 'fullScreen',
          allowMultiSelection: false,
          mode: 'open',
          type: [types.csv, types.xlsx, types.xls],
        }),
      ).pipe(
        map(it =>
          Platform.OS === 'ios' ? it.uri.replace('file://', '') : it.uri,
        ),
        switchMap(response => RNFetchBlob.fs.readFile(response, 'ascii')),
        switchMap(excelFile => {
          const workbook = XLSX.read(new Uint8Array(excelFile), {
            type: 'buffer',
          });

          const wsname = workbook.SheetNames[0];
          const ws = workbook.Sheets[wsname];
          const localData: Array<Array<number> | Array<string>> =
            XLSX.utils.sheet_to_json(ws, {
              header: 1,
            });

          return getJSONDataRx(localData).pipe(
            map(json => ({
              jsonData: json,
              data: localData,
              widthArr: make_width(ws),
            })),
          );
        }),
      );
    }
  }

  export namespace Store {
    import DataExcel = UtilApp.Excel.DataExcel;

    export function checkDataRecord<T extends Partial<DataExcel>>(
      source: Readonly<T> | undefined,
      data: Readonly<T>,
    ): T {
      return Object.entries(data).reduce(
        (acc: Record<string, unknown>, [key, value]) => {
          const check = source ? source[key as keyof T] : undefined;
          acc[key] = value === undefined ? check : value;
          return acc;
        },
        {},
      ) as T;
    }
  }
}

export default UtilApp;
