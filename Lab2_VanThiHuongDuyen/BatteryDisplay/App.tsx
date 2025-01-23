import React from 'react';
import { SceneMap, TabView } from 'react-native-tab-view';
import BatteryScreen from './components/BatteryScreen';
import BrightnessScreen from './components/BrightnessScreen';

const renderScene = SceneMap({
  first: BatteryScreen,
  second: BrightnessScreen,
});

const routes = [
  {key: 'first', title: 'Battery'},
  {key: 'second', title: 'Brightness'},
];

const App = () => {
  // const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);

  return (
    <TabView
      navigationState={{index, routes}}
      renderScene={renderScene}
      onIndexChange={setIndex}
    />
  );
};



export default App;
