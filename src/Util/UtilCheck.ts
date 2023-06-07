import {Alert, Platform} from 'react-native';
import {from, of, switchMap} from 'rxjs';
import {check, openSettings, PERMISSIONS} from 'react-native-permissions';
import DeviceInfo from 'react-native-device-info';
import EntityPermissionTS from './EntityPermissionTS';
import TypePermission from './TypePermission';

function checkAndroidRx() {
  return from(DeviceInfo.getApiLevel()).pipe(
    switchMap(apiAndroid =>
      from(
        check(
          apiAndroid >= 33
            ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
            : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        ),
      ),
    ),
  );
}

export function checkPermissionRx() {
  return of(Platform.OS === 'android').pipe(
    switchMap(isAndroid =>
      isAndroid
        ? checkAndroidRx()
        : EntityPermissionTS.getPermissionDevice(TypePermission.Photo),
    ),
  );
}

export function noPermission() {
  Alert.alert(
    'Невозможно сохранить изображение',
    'Разрешите доступ к медиатеке',
    [
      {
        text: 'Открыть настойки',
        onPress: () =>
          openSettings().catch(() => console.warn('cannot open settings')),
      },
      {
        text: 'Закрыть',
      },
    ],
  );
}
