import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import appConfig from './app.json';
import { checkVersion } from './src/utils/versionCheck';

import HomeScreen from './src/screens/HomeScreen';
import PregnancyScreen from './src/screens/PregnancyScreen';
import BabyScreen from './src/screens/BabyScreen';
import GrowthScreen from './src/screens/GrowthScreen';
import KnowledgeScreen from './src/screens/KnowledgeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{
          headerTitle: '我的',
          headerStyle: { backgroundColor: '#FFF5F5' },
          headerTitleStyle: { color: '#FF6B8A', fontWeight: 'bold', fontSize: 18 },
        }}
      />
      <ProfileStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: '設置',
          headerStyle: { backgroundColor: '#FFF5F5' },
          headerTitleStyle: { color: '#FF6B8A', fontWeight: 'bold', fontSize: 18 },
          headerTintColor: '#FF6B8A',
        }}
      />
    </ProfileStack.Navigator>
  );
}

export default function App() {
  const [versionState, setVersionState] = useState({ checking: true, needsUpdate: false, latestVersion: null });

  useEffect(() => {
    (async () => {
      const result = await checkVersion(appConfig.expo.version);
      setVersionState({ checking: false, ...result });
    })();
  }, []);

  if (versionState.checking) {
    return (
      <View style={updateStyles.container}>
        <ActivityIndicator size="large" color="#FF6B8A" />
      </View>
    );
  }

  if (versionState.needsUpdate) {
    return (
      <View style={updateStyles.container}>
        <Ionicons name="cloud-download-outline" size={80} color="#FF6B8A" />
        <Text style={updateStyles.title}>需要更新</Text>
        <Text style={updateStyles.subtitle}>
          發現新版本 {versionState.latestVersion}，請更新後繼續使用
        </Text>
        <Text style={updateStyles.subtitle}>目前版本：{appConfig.expo.version}</Text>
        <TouchableOpacity
          style={updateStyles.button}
          onPress={() => Linking.openURL('https://apps.apple.com/app/com.babyreminder.app')}
        >
          <Ionicons name="open-outline" size={20} color="#FFF" />
          <Text style={updateStyles.buttonText}>前往下載</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            switch (route.name) {
              case '首頁': iconName = focused ? 'home' : 'home-outline'; break;
              case '孕期': iconName = focused ? 'flower' : 'flower-outline'; break;
              case '寶寶': iconName = focused ? 'happy' : 'happy-outline'; break;
              case '成長': iconName = focused ? 'trending-up' : 'trending-up-outline'; break;
              case '知識': iconName = focused ? 'book' : 'book-outline'; break;
              case '我的': iconName = focused ? 'person' : 'person-outline'; break;
              default: iconName = 'ellipse';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#FF6B8A',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#F0F0F0',
            paddingBottom: 4,
            height: 56,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          headerStyle: {
            backgroundColor: '#FFF5F5',
          },
          headerTitleStyle: {
            color: '#FF6B8A',
            fontWeight: 'bold',
            fontSize: 18,
          },
        })}
      >
        <Tab.Screen name="首頁" component={HomeScreen} />
        <Tab.Screen name="孕期" component={PregnancyScreen} />
        <Tab.Screen name="寶寶" component={BabyScreen} />
        <Tab.Screen name="成長" component={GrowthScreen} />
        <Tab.Screen name="知識" component={KnowledgeScreen} />
        <Tab.Screen
          name="我的"
          component={ProfileStackScreen}
          options={{ headerShown: false }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const updateStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FF6B8A', marginTop: 20 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 12, lineHeight: 22 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B8A',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 24,
  },
  buttonText: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginLeft: 8 },
});
