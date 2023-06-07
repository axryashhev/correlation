import UtilApp from '../../Util/UtilApp';

namespace Root {
  import PositionScreen = UtilApp.PositionScreen;
  type ContextActionData = {
    data: Array<Array<number> | Array<string>>;
    widthArr: Array<number>;
  };
  export type Stack = {
    Home: undefined;
    ContextActionData: ContextActionData;
    Error: undefined;
  };

  export type Drawer = {
    ShowData: ContextActionData;
    Setting: undefined;
    Chart: {position?: PositionScreen};
    Error: undefined;
    About: undefined;
  };
}
export default Root;
