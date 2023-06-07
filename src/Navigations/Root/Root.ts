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
    Chart: Partial<{
      position: PositionScreen;
      labelResult: string;
      topFactorResult: string;
    }>;
    Error: undefined;
    About: undefined;
  };
}
export default Root;
