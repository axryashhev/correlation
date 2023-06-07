import React from 'react';
import {action, autorun, makeObservable, observable} from 'mobx';
import UtilApp from '../../Util/UtilApp';
import storage, {checkKeyof} from '../../Storage/storage';

import checkDataRecord = UtilApp.Store.checkDataRecord;
import {Subject} from 'rxjs';

import DataExcel = UtilApp.Excel.DataExcel;

export type ChartData = 'linear' | 'bubble' | 'scatter';

class DataStore {
  private static TAG = 'CompositeMainUserStore';
  jsonData?: DataExcel = undefined;
  subjectError$ = new Subject<string>();
  typeChartData: ChartData = 'linear';
  typeChartCorrelation: ChartData = 'bubble';
  topFactor: keyof DataExcel | undefined = undefined;

  constructor() {
    makeObservable(this, {
      jsonData: observable,
      topFactor: observable,
      typeChartData: observable,
      typeChartCorrelation: observable,
      setJSONData: action.bound,
      setTopFactor: action.bound,
      setTypeChartData: action.bound,
      setTypeChartCorrelation: action.bound,
    });

    const storedJson = storage.getString(DataStore.TAG);
    if (storedJson) {
      Object.assign(this, JSON.parse(storedJson));
    }

    autorun(() => {
      const data = JSON.stringify(
        checkKeyof(this, [
          'typeChartData',
          'typeChartCorrelation',
          'topFactor',
        ]),
      );
      storage.set(DataStore.TAG, data);
    });
  }
  setTopFactor(topFactor: keyof DataExcel) {
    this.topFactor = topFactor;
  }

  setTypeChartData(typeChartData: ChartData) {
    this.typeChartData = typeChartData;
    // console.log('tes: ', this.typeChartData);
  }

  setTypeChartCorrelation(typeChartCorrelation: ChartData) {
    this.typeChartCorrelation = typeChartCorrelation;
  }

  setJSONData(jsonData: Readonly<Partial<DataExcel>>) {
    this.jsonData = Object.assign(
      this.jsonData ?? {},
      checkDataRecord(this.jsonData, jsonData),
    );
  }
}

const dataStore = new DataStore();

export const DataStoreContext = React.createContext(dataStore);
export const useDataStore = () => React.useContext(DataStoreContext);
