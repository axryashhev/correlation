import {MMKV} from 'react-native-mmkv';

const storage = new MMKV();

export enum KeyStorage {
  LOG_ERROR = 'LOG_ERROR',
}

export function checkKeyof<T extends ThisType<unknown>, U extends keyof T>(
  source: T,
  pickFields: Array<U>,
) {
  return Object.entries(source)
    .filter(([key]) => !!pickFields.find(field => key === field))
    .reduce((accum: Record<string, unknown>, [k, v]) => {
      accum[k] = v;
      return accum;
    }, {});
}

export default storage;
