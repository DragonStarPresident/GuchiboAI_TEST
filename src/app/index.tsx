import { LinearGradient } from 'expo-linear-gradient';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getProfile } from '@/lib/storage';
import { colors, spacing } from '@/lib/theme';

export default function Splash() {
  const [ready, setReady] = useState(false);
  const [destination, setDestination] = useState<'/onboarding' | '/home'>('/onboarding');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const profile = await getProfile();
      const start = Date.now();
      const dest = profile?.onboarded ? '/home' : '/onboarding';
      const elapsed = Date.now() - start;
      // 起動画面を少し見せてから遷移する（ブランド演出）
      setTimeout(() => {
        if (!mounted) return;
        setDestination(dest);
        setReady(true);
      }, Math.max(600 - elapsed, 0));
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (ready) {
    return <Redirect href={destination} />;
  }

  return (
    <LinearGradient colors={[colors.gradientSoft[0], colors.gradientSoft[1]]} style={styles.container}>
      <View style={styles.logoWrap}>
        <Text style={styles.logoEmoji}>😊</Text>
      </View>
      <Text style={styles.title}>
        Guchibo<Text style={{ color: colors.accentCoral }}>.</Text>
      </Text>
      <Text style={styles.subtitle}>孤独に、会話という居場所を。</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  logoWrap: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoEmoji: {
    fontSize: 44,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
