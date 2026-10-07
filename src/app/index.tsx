import { LinearGradient } from 'expo-linear-gradient';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Logo } from '@/components/Brand';
import { getProfile } from '@/lib/storage';
import { colors, spacing } from '@/lib/theme';

export default function Splash() {
  const [destination, setDestination] = useState<'/onboarding' | '/home' | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const profile = await getProfile();
      const dest = profile?.onboarded ? '/home' : '/onboarding';
      // 起動画面を少し見せてから遷移する
      setTimeout(() => mounted && setDestination(dest), 700);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (destination) return <Redirect href={destination} />;

  return (
    <LinearGradient colors={[colors.gradientSoft[0], colors.gradientSoft[1]]} style={styles.container}>
      <Logo size={96} style={{ marginBottom: spacing.lg }} />
      <Text style={styles.title}>
        Guchibo<Text style={{ color: colors.accentCoral }}>.</Text>
      </Text>
      <Text style={styles.subtitle}>孤独に、会話という居場所を。</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  title: { fontSize: 32, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  subtitle: { fontSize: 14, color: colors.textSecondary, letterSpacing: 1 },
});
