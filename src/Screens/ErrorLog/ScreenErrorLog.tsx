import React, {useState} from 'react';
import {Button, ScrollView, Text} from 'react-native';
import storage, {KeyStorage} from '../../Storage/storage';

const ScreenErrorLog = () => {
  const [text, setText] = useState(
    storage.getString(KeyStorage.LOG_ERROR) ?? '',
  );

  const onClear = () => {
    storage.clearAll();
    setText('');
  };

  return (
    <ScrollView contentContainerStyle={{flex: 1, alignItems: 'center'}}>
      <Button title={'Очистить данные'} onPress={onClear} />
      <Text selectable={true} style={{color: 'red'}}>
        {text}
      </Text>
    </ScrollView>
  );
};

export default ScreenErrorLog;
