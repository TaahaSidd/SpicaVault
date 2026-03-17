import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { VaultProvider } from './context/VaultContext';

import AlbumDetailScreen from './screens/AlbumDetailScreen';
import AlbumsScreen from './screens/AlbumsScreen';
import BiometricScreen from './screens/BiometricScreen';
import ChangePINScreen from './screens/ChangePINScreen';
import FavouritesScreen from './screens/FavouritesScreen';
import ImportMediaScreen from './screens/ImportMediaScreen';
import MediaInfoScreen from './screens/MediaInfoScreen';
import MediaViewerScreen from './screens/MediaViewerScreen';
import SettingsScreen from './screens/SettingsScreen';
import StealthModeScreen from './screens/StealthModeScreen';
import StorageAnalysisScreen from './screens/StorageAnalysisScreen';
import VaultHomeScreen from './screens/VaultHomeScreen';
import VideoPlayerScreen from './screens/VideoPlayerScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const SLIDE = { animation: 'slide_from_right' };

function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={() => null}  // ← no tab bar, each screen renders its own BottomNavBar
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Vault" component={VaultHomeScreen} />
      <Tab.Screen name="Albums" component={AlbumsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen name="Favourites" component={FavouritesScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
      <SafeAreaProvider>
        <VaultProvider>
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#0A0A0F' },
                animation: 'none',
              }}
            >
              <Stack.Screen name="Main" component={TabNavigator} />
              <Stack.Screen name="ImportMedia" component={ImportMediaScreen} options={SLIDE} />
              <Stack.Screen name="ChangePIN" component={ChangePINScreen} options={SLIDE} />
              <Stack.Screen name="Biometric" component={BiometricScreen} options={SLIDE} />
              <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} options={{ animation: 'fade' }} />
              <Stack.Screen name="MediaInfo" component={MediaInfoScreen} options={SLIDE} />
              <Stack.Screen name="StealthMode" component={StealthModeScreen} options={SLIDE} />
              <Stack.Screen name="StorageAnalysis" component={StorageAnalysisScreen} options={SLIDE} />
              <Stack.Screen name="AlbumDetail" component={AlbumDetailScreen} options={SLIDE} />
              <Stack.Screen name="MediaViewer" component={MediaViewerScreen} options={{ animation: 'fade' }} />
            </Stack.Navigator>
          </NavigationContainer>
        </VaultProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}