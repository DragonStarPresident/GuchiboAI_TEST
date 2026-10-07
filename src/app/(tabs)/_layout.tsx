import { Ionicons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import React from 'react';
import { ColorValue, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, shadow } from '@/lib/theme';

type IconName = keyof typeof Ionicons.glyphMap;

function tabIcon(outline: IconName, filled: IconName) {
  return ({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) => (
    <Ionicons name={focused ? filled : outline} size={size - 2} color={color} />
  );
}

// 中央の「はなす」ボタン。タブとしては切り替えず、チャット画面を開く
function TalkButton() {
  return (
    <Pressable
      onPress={() => router.push('/chat')}
      style={styles.talkWrap}
      accessibilityRole="button"
      accessibilityLabel="Guchiboとはなす"
    >
      <View style={styles.talkButton}>
        <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
      </View>
      <Text style={styles.talkLabel}>はなす</Text>
    </Pressable>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: 'ホーム', tabBarIcon: tabIcon('home-outline', 'home') }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: 'きろく', tabBarIcon: tabIcon('time-outline', 'time') }}
      />
      <Tabs.Screen
        name="talk"
        options={{
          title: 'はなす',
          tabBarButton: () => <TalkButton />,
        }}
      />
      <Tabs.Screen
        name="feelings"
        options={{ title: 'きもち', tabBarIcon: tabIcon('happy-outline', 'happy') }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: '設定', tabBarIcon: tabIcon('settings-outline', 'settings') }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  talkWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-start' },
  talkButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
    ...shadow.card,
    shadowOpacity: 0.2,
  },
  talkLabel: { fontSize: 10, fontWeight: '700', color: colors.primary, marginTop: 3 },
});
