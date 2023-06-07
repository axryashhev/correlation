import React from 'react';
import {View, Text} from 'react-native';

const ScreenAbout = () => (
  <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
    <Text style={{marginHorizontal: 10, marginBottom: 10, color: 'black'}}>
      Разработка мобильного приложения для анализа влияния различных параметров
      на успеваемость студентов с помощью корреляционно регрессионного анализа
    </Text>
    <Text style={{marginBottom: 10, color: 'black'}}>Выполнили работу:</Text>
    <Text style={{color: 'black'}}>Вялитова Д.Р. - Руководитель проекта</Text>
    <Text style={{color: 'black'}}>Хрящев А.А. - Программист</Text>
    <Text style={{color: 'black'}}>Тчанников А.В. - Менеджер</Text>
  </View>
);

export default ScreenAbout;
