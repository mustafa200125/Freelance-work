import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function TabsLayout() {
  const { user } = useAuth();
  const isEmployer = user?.user_type === 'employer';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1E3A8A',
        tabBarInactiveTintColor: '#B45309',
        tabBarStyle: {
          backgroundColor: '#FDE68A',
          borderTopWidth: 3,
          borderTopColor: '#D97706',
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ color, focused, size }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              {focused && <View style={styles.iconDecor} />}
              <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: isEmployer ? 'وظائفي' : 'الوظائف',
          tabBarIcon: ({ color, focused, size }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              {focused && <View style={styles.iconDecor} />}
              <Ionicons name={focused ? 'briefcase' : 'briefcase-outline'} size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'الرسائل',
          tabBarIcon: ({ color, focused, size }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              {focused && <View style={styles.iconDecor} />}
              <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'الحساب',
          tabBarIcon: ({ color, focused, size }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              {focused && <View style={styles.iconDecor} />}
              <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 50,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  iconContainerActive: {
    backgroundColor: '#FFFBEB',
    borderWidth: 2,
    borderColor: '#D97706',
  },
  iconDecor: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    backgroundColor: '#1E3A8A',
    borderRadius: 4,
  },
});