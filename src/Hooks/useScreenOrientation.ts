import {useEffect, useRef, useState} from 'react';
import {Subject} from 'rxjs';
import UtilApp from '../Util/UtilApp';
import PositionScreen = UtilApp.PositionScreen;
import {LayoutChangeEvent} from 'react-native';

const useScreenOrientation = () => {
  const [positionScreen, setPositionScreen] = useState(PositionScreen.Portrait);
  const subjectDetectOrientation$ = useRef(new Subject<PositionScreen>());

  useEffect(() => {
    const subscription$ = subjectDetectOrientation$.current.subscribe(pos => {
      setPositionScreen(pos);
    });

    return () => subscription$.unsubscribe();
  }, []);

  const detectOrientation = (width: number, height: number) => {
    subjectDetectOrientation$.current.next(
      width > height ? PositionScreen.Landscape : PositionScreen.Portrait,
    );
  };

  const onLayoutHandle = (event: LayoutChangeEvent) =>
    detectOrientation(
      event.nativeEvent.layout.width,
      event.nativeEvent.layout.height,
    );

  return {onLayoutHandle, positionScreen, subjectDetectOrientation$};
};

export default useScreenOrientation;
