import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, spacing } from '@/lib/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    eyebrow: 'WELCOME',
    title: '気持ちは、\nそのまま話していい。',
    body: 'うまく言葉にできなくても大丈夫。頭に浮かんだことを、そのまま打ち込んでみてください。',
  },
  {
    eyebrow: 'HOW IT WORKS',
    title: 'まずは、\nあなたの気持ちを受け止めます。',
    body: '説教せず、否定せず、ただ寄り添う対話を大切にしています。',
  },
  {
    eyebrow: 'GOAL',
    title: '少しだけ、\n心を軽く。',
    body: '「ひとりで抱える」から、「少し吐き出せる」へ。',
  },
];

export default function Onboarding() {
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: width * (index + 1), animated: true });
      setIndex(index + 1);
    } else {
      router.replace('/register');
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.skip} onPress={() => router.replace('/register')}>
        <Text style={styles.skipText}>スキップ</Text>
      </Pressable>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <LinearGradient
              colors={[colors.gradientSoft[0], colors.gradientSoft[1]]}
              style={styles.illustration}
            >
              <View style={styles.iconCircle}>
                <Text style={{ fontSize: 40 }}>😊</Text>
              </View>
            </LinearGradient>

            <Text style={styles.eyebrow}>{slide.eyebrow}</Text>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.body}>{slide.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <PrimaryButton
          label={index === SLIDES.length - 1 ? 'はじめる' : 'つぎへ'}
          onPress={goNext}
          style={{ paddingHorizontal: spacing.xl }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },
  skip: {
    position: 'absolute',
    top: 60,
    right: spacing.lg,
    zIndex: 10,
    padding: spacing.sm,
  },
  skipText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  slide: {
    paddingHorizontal: spacing.lg,
    alignItems: 'flex-start',
  },
  illustration: {
    width: '100%',
    height: 220,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 36,
    marginBottom: spacing.md,
  },
  body: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.primary,
  },
});
