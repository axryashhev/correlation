import {ChartData} from '../../../../Stores/DataStore/DataStore';
import {
  BubbleChart,
  BubbleData,
  ChartLegend,
  LineChart,
  LineData,
  ScatterChart,
  ScatterData,
} from 'react-native-charts-wrapper';
import React, {useMemo} from 'react';
import {processColor} from 'react-native';

type ChartViewProps = {
  type: ChartData;
  data: ScatterData | LineData | BubbleData;
};

const legend: ChartLegend = {
  enabled: true,
  textSize: 11,
  textColor: processColor('black'),
  form: 'CIRCLE',
  wordWrapEnabled: true,
};

const marker = {
  enabled: true,
};

const ChartView = ({type, data}: ChartViewProps) =>
  useMemo(() => {
    switch (type) {
      case 'scatter':
        return (
          <ScatterChart
            style={{flex: 1}}
            data={data as ScatterData}
            legend={legend}
            marker={marker}
            xAxis={{
              textColor: processColor('black'),
            }}
            yAxis={{
              left: {
                textColor: processColor('black'),
              },
              right: {
                textColor: processColor('black'),
              },
            }}
            chartDescription={{text: ''}}
            onChange={event => console.log(event.nativeEvent)}
          />
        );
      case 'linear':
        return (
          <LineChart
            style={{flex: 1}}
            data={data as LineData}
            chartDescription={{text: ''}}
            legend={legend}
            marker={marker}
            xAxis={{
              textColor: processColor('black'),
            }}
            yAxis={{
              left: {
                textColor: processColor('black'),
              },
              right: {
                textColor: processColor('black'),
              },
            }}
            drawGridBackground={false}
            borderWidth={1}
            drawBorders={true}
            autoScaleMinMaxEnabled={false}
            touchEnabled={true}
            dragEnabled={true}
            scaleEnabled={true}
            scaleXEnabled={true}
            scaleYEnabled={true}
            pinchZoom={true}
            doubleTapToZoomEnabled={true}
            highlightPerTapEnabled={true}
            highlightPerDragEnabled={false}
            // visibleRange={this.state.visibleRange}
            dragDecelerationEnabled={true}
            dragDecelerationFrictionCoef={0.99}
            // ref="chart"
            keepPositionOnRotation={false}
            // onSelect={this.handleSelect.bind(this)}
          />
        );
      case 'bubble':
        return (
          <BubbleChart
            style={{flex: 1}}
            data={data as BubbleData}
            xAxis={{
              textColor: processColor('black'),
            }}
            yAxis={{
              left: {
                textColor: processColor('black'),
              },
              right: {
                textColor: processColor('black'),
              },
            }}
            chartDescription={{text: ''}}
            legend={legend}
            animation={{
              durationX: 1500,
              durationY: 1500,
              easingX: 'EaseInCirc',
            }}
            // onSelect={this.handleSelect.bind(this)}
            onChange={event => console.log(event.nativeEvent)}
          />
        );
    }
  }, [data, type]);

export default ChartView;
