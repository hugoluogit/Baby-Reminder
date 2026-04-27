import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

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
