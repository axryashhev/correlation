import React, {useCallback} from 'react';
import {FlatList, ListRenderItem, StyleProp, ViewStyle} from 'react-native';
import {ItemSelectCorrelation} from '../../ScreenChart';

import styles from './ListHeaderRender.styles';
import {Button} from '@rneui/themed';

interface ListHeaderRenderProps {
  items: Array<ItemSelectCorrelation>;
  style?: StyleProp<ViewStyle>;
  onPressItem?: (item: ItemSelectCorrelation) => void;
}
const ListHeaderRender = ({
  items,
  onPressItem,
  style,
}: ListHeaderRenderProps) => {
  const renderItem: ListRenderItem<ItemSelectCorrelation> = useCallback(
    ({item}) => (
      <Button
        title={item.value as string}
        containerStyle={styles.containerStyle}
        buttonStyle={{
          backgroundColor: item.selected ? '#64ff22' : '#F4F4F4',
        }}
        titleStyle={{
          fontSize: 14,
          color: item.selected ? '#ffffff' : 'black',
        }}
        onPress={() => onPressItem && onPressItem(item)}
      />
    ),
    [onPressItem],
  );

  return (
    <FlatList
      keyExtractor={item => String(item.value)}
      style={[styles.list, style]}
      data={items}
      horizontal={true}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
    />
  );
};

export default ListHeaderRender;
