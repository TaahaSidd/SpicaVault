import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import { AppState, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { VaultProvider } from './context/VaultContext';
import { getCalcCode, getPinEnabled, getStealthMode } from './utils/SecureSettings';

import CalculatorDecoy from './components/CalculatorDecoy';
import AlbumDetailScreen from './screens/AlbumDetailScreen';
import AlbumsScreen from './screens/AlbumsScreen';
import FavouritesScreen from './screens/FavouritesScreen';
import ImportMediaScreen from './screens/ImportMediaScreen';
import ImportSettingsScreen from './screens/ImportSettingsScreen';
import LockScreen from './screens/LockScreen';
import MediaInfoScreen from './screens/MediaInfoScreen';
import MediaViewerScreen from './screens/MediaViewerScreen';
import SecurityScreen from './screens/SecurityScreen';
import SettingsScreen from './screens/SettingsScreen';
import StealthModeScreen from './screens/StealthModeScreen';
import StorageAnalysisScreen from './screens/StorageAnalysisScreen';
import VaultHomeScreen from './screens/VaultHomeScreen';
import VideoPlayerScreen from './screens/VideoPlayerScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const SLIDE = { animation: 'slide_from_right', headerShown: false };
const LOCK_GRACE_MS = 30_000;

function TabNavigator() {
  return (
    <Tab.Navigator tabBar={() => null} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Vault" component={VaultHomeScreen} />
      <Tab.Screen name="Albums" component={AlbumsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen name="Favourites" component={FavouritesScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLocked, setIsLocked] = useState(false);
  const [pinReady, setPinReady] = useState(false);
  const [securityConfig, setSecurityConfig] = useState({ mode: 'none', calcCode: '' });
  const bgTimestamp = useRef(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => { checkInitialLock(); }, []);

  async function checkInitialLock() {
    const pinEnabled = await getPinEnabled();
    const stealthMode = await getStealthMode();
    const calcCode = await getCalcCode();
    setSecurityConfig({ mode: stealthMode, calcCode: calcCode || '5+5' });
    if (pinEnabled || (stealthMode === 'calculator' && calcCode)) setIsLocked(true);
    setPinReady(true);
  }

  useEffect(() => {
    const sub = AppState.addEventListener('change', async (nextState) => {
      const prev = appState.current;
      appState.current = nextState;
      if (prev === 'active' && nextState === 'background') {
        bgTimestamp.current = Date.now();
      }
      if ((prev === 'background' || prev === 'inactive') && nextState === 'active') {
        const pinEnabled = await getPinEnabled();
        const stealthMode = await getStealthMode();
        if (!pinEnabled && stealthMode !== 'calculator') return;
        const elapsed = bgTimestamp.current ? Date.now() - bgTimestamp.current : Infinity;
        if (elapsed > LOCK_GRACE_MS) {
          const code = await getCalcCode();
          setSecurityConfig({ mode: stealthMode, calcCode: code || '5+5' });
          setIsLocked(true);
        }
        bgTimestamp.current = null;
      }
    });
    return () => sub.remove();
  }, []);

  if (!pinReady) return null;

  if (isLocked) {
    return (
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
        <SafeAreaProvider>
          {securityConfig.mode === 'calculator' ? (
            <CalculatorDecoy secretCode={securityConfig.calcCode} onUnlock={() => setIsLocked(false)} />
          ) : (
            <LockScreen onUnlock={() => setIsLocked(false)} />
          )}
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
      <SafeAreaProvider>
        <VaultProvider>
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerShown: false, // ✅ global default
                contentStyle: { backgroundColor: '#0A0A0F' },
                animation: 'none',
              }}
            >
              <Stack.Screen name="Main" component={TabNavigator} />
              <Stack.Screen name="ImportMedia" component={ImportMediaScreen} options={SLIDE} />
              <Stack.Screen name="Security" component={SecurityScreen} options={SLIDE} />
              {/* ✅ headerShown: false explicitly set — animation alone was resetting it */}
              <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} options={{ animation: 'fade', headerShown: false }} />
              <Stack.Screen name="MediaInfo" component={MediaInfoScreen} options={SLIDE} />
              <Stack.Screen name="StealthMode" component={StealthModeScreen} options={SLIDE} />
              <Stack.Screen name="StorageAnalysis" component={StorageAnalysisScreen} options={SLIDE} />
              <Stack.Screen name="AlbumDetail" component={AlbumDetailScreen} options={SLIDE} />
              <Stack.Screen name="ImportSettings" component={ImportSettingsScreen} options={SLIDE} />
              <Stack.Screen name="MediaViewer" component={MediaViewerScreen} options={{ animation: 'fade', headerShown: false }} />
            </Stack.Navigator>
          </NavigationContainer>
        </VaultProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}