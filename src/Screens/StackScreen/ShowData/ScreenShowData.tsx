import React from 'react';
import TableData from '../../Data/components/TableData/TableData';
import {ScrollView} from 'react-native';
import styles from '../../Data/ScreenData.styles';
import {DrawerScreenProps} from '@react-navigation/drawer';
import Root from '../../../Navigations/Root/Root';
import {SafeAreaView} from 'react-native-safe-area-context';
import useSafeAreaApp from '../../../Hooks/useSafeAreaApp';

type ScreenShowDataProps = DrawerScreenProps<Root.Drawer, 'ShowData'>;

const ScreenShowData = ({route}: ScreenShowDataProps) => {
  const {renderEdges} = useSafeAreaApp();
  return (
    <SafeAreaView style={styles.safeArea} edges={renderEdges}>
      <ScrollView contentContainerStyle={styles.container} horizontal={true}>
        <TableData data={route.params.data} widthArr={route.params.widthArr} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ScreenShowData;
