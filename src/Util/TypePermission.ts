import {Permission, Platform} from 'react-native';
import {PERMISSIONS} from 'react-native-permissions';
import DeviceInfo from 'react-native-device-info';

type TypePermissions = Record<'Photo', Permission | string>;

const TypePermission: TypePermissions = {
  Photo: Platform.select({
    ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
    android:
      DeviceInfo.getApiLevelSync() >= 31
        ? PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
        : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
  })!,
};

export default TypePermission;
