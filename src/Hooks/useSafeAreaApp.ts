import {useEffect, useMemo, useState} from 'react';
import {Edge} from 'react-native-safe-area-context';
import {
  OrientationType,
  useDeviceOrientationChange,
} from 'react-native-orientation-locker';

import UtilApp from '../Util/UtilApp';
import PositionScreen = UtilApp.PositionScreen;

function getEdges(lastLandscapePosition?: OrientationType) {
  let result: Edge[] = [];
  switch (lastLandscapePosition) {
    case OrientationType['LANDSCAPE-RIGHT']:
      result.push('right');
      break;
    case OrientationType['LANDSCAPE-LEFT']:
      result.push('left');
      break;
  }
  return result;
}
const useSafeAreaApp = (positionScreen?: PositionScreen) => {
  const [lastLandscapePosition, setLastLandscapePosition] = useState<
    OrientationType | undefined
  >(undefined);
  const [deviceOrientation, setDeviceOrientation] = useState<OrientationType>(
    OrientationType.PORTRAIT,
  );

  const renderEdges = useMemo(() => {
    return getEdges(lastLandscapePosition);
  }, [lastLandscapePosition]);

  const renderChart = useMemo(() => {
    const t = getEdges(lastLandscapePosition);
    if (positionScreen && positionScreen === PositionScreen.Portrait) {
      return t;
    }
    t.push('bottom');
    return t;
  }, [lastLandscapePosition, positionScreen]);

  useDeviceOrientationChange(setDeviceOrientation);

  useEffect(() => {
    // console.log('test2');
    if (
      deviceOrientation === OrientationType['LANDSCAPE-LEFT'] ||
      deviceOrientation === OrientationType['LANDSCAPE-RIGHT']
    ) {
      setLastLandscapePosition(deviceOrientation);
    }
  }, [deviceOrientation]);

  return {
    renderEdges,
    renderChart,
  };
};

export default useSafeAreaApp;
