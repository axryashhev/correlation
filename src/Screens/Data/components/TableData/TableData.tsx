import React from 'react';
import {ScrollView} from 'react-native';
import {Table, Row, Rows, TableWrapper} from 'react-native-reanimated-table';
import styles from './TableData.styles';

type TableDataProps = {
  data: Array<Array<number> | Array<string>>;
  widthArr?: Array<number>;
};

const TableData = ({data, widthArr}: TableDataProps) => (
  <ScrollView style={styles.table}>
    <Table style={styles.table}>
      <TableWrapper>
        <Row
          data={data[0]}
          style={styles.thead}
          textStyle={styles.text}
          widthArr={widthArr}
        />
      </TableWrapper>
      <ScrollView>
        <TableWrapper>
          <Rows
            data={data.slice(1)}
            style={styles.tr}
            textStyle={styles.text}
            widthArr={widthArr}
          />
        </TableWrapper>
      </ScrollView>
    </Table>
  </ScrollView>
);

export default TableData;
