import React, {useCallback, useState} from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {Text, TouchableOpacity, View} from 'react-native';
import styles from './MultiSelect.styles';
import {MultiSelect} from 'react-native-element-dropdown';
import {ItemSelectCorrelation} from '../../ScreenChart.util';

type Item = ItemSelectCorrelation;

type EmitData = string | Array<string>;

const BigSize = 'Не должно быть более 2 параметров';
const SmallSize = 'Меньше двух параметров';

type MultiSelectViewProps = {
  data: Array<Item>;
  onEmitData?: (data: EmitData) => void;
  onEmitMessageError?: (message: string) => void;
};

const MultiSelectView = ({
  data,
  onEmitData,
  onEmitMessageError,
}: MultiSelectViewProps) => {
  const [selected, setSelected] = useState<Array<string>>([]);

  const renderDataItem = (item: Item) => (
    <View style={styles.item}>
      <Text style={styles.selectedTextStyle}>{item.label}</Text>
      <AntDesign style={styles.icon} color="black" name="Safety" size={20} />
    </View>
  );

  const renderSelectedItem = (item: Item, unSelect?: (item: Item) => void) => (
    <TouchableOpacity onPress={() => unSelect && unSelect(item)}>
      <View style={styles.selectedStyle}>
        <Text style={styles.textSelectedStyle}>{item.label}</Text>
        <AntDesign color="black" name="delete" size={17} />
      </View>
    </TouchableOpacity>
  );

  const onChange = useCallback(
    (item: Array<string>) => {
      if (item.length > 2) {
        onEmitMessageError && onEmitMessageError(BigSize);
      }
      setSelected(item);
    },
    [onEmitMessageError],
  );

  const onBlur = useCallback(() => {
    if (selected.length === 2) {
      onEmitData && onEmitData(selected);
      return;
    }
    onEmitData && onEmitData(selected.length > 2 ? BigSize : SmallSize);
  }, [onEmitData, selected]);

  return (
    <MultiSelect
      style={styles.dropdown}
      placeholderStyle={styles.placeholderStyle}
      selectedTextStyle={styles.selectedTextStyle}
      inputSearchStyle={styles.inputSearchStyle}
      iconStyle={styles.iconStyle}
      itemTextStyle={{
        color: 'black',
      }}
      data={data}
      onBlur={onBlur}
      labelField="label"
      valueField="value"
      placeholder="Выберите два параметра"
      value={selected}
      searchPlaceholder="Search..."
      renderLeftIcon={() => (
        <AntDesign style={styles.icon} color="black" name="Safety" size={20} />
      )}
      renderItem={renderDataItem}
      renderSelectedItem={renderSelectedItem}
      onChange={onChange}
    />
  );
};
export default MultiSelectView;
