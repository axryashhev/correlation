import React, {useMemo} from 'react';
import Toast from 'react-native-easy-toast';
import {StyleSheet} from 'react-native';
import DeviceInfo from 'react-native-device-info';

type ToastDataProps = Record<'isLandscape', boolean>;

const ToastData = React.forwardRef<Toast, ToastDataProps>(
  ({isLandscape}, ref) => {
    const position = useMemo(
      () =>
        isLandscape ? (DeviceInfo.isTablet() ? 'center' : 'top') : 'center',
      [isLandscape],
    );

    return (
      <Toast
        ref={ref}
        // @ts-ignore
        style={styles.toast}
        position={position}
        fadeInDuration={300}
        fadeOutDuration={500}
        opacity={0.5}
        textStyle={styles.textStyle}
      />
    );
  },
);

export default ToastData;

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    backgroundColor: 'black',
  },
  textStyle: {color: 'white'},
});
