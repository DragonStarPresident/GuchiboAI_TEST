import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Character, CharacterPose } from '@/components/Brand';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, spacing } from '@/lib/theme';

const SLIDES: { eyebrow: string; title: string; body: string; pose: CharacterPose; bg: readonly [string, string] }[] = [
  {
    eyebrow: 'WELCOME',
    title: '気持ちは、\nそのまま話していい。',
    body: 'うまく言葉にできなくても大丈夫。頭に浮かんだことを、そのまま打ち込んでみてください。',
    pose: 'wave',
    bg: ['#ECE6FC', '#F4F0FD'],
  },
  {
    eyebrow: 'HOW IT WORKS',
    title: 'AIが、そっと\n受け止めます。',
    body: '否定も、急かしもしません。あなたのペースに合わせて、Guchiboが静かに耳を傾けます。',
    pose: 'pray',
    bg: ['#F8E8F1', '#F4EEFB'],
  },
  {
    eyebrow: 'YOUR SPACE',
    title: 'ひとりで抱えない、\n会話という居場所。',
    body: 'いつでも、何度でも。「少し吐き出せる」場所が、あなたのそばにあります。',
    pose: 'heart',
    bg: ['#E6F4EC', '#F1F0FB'],
  },
];

export default function Onboarding() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const illustrationHeight = Math.min(300, height * 0.34);

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
    <View style={[styles.container, { paddingTop: insets.top + spacing.xl }]}>
      <Pressable style={[styles.skip, { top: insets.top + spacing.xs }]} onPress={() => router.replace('/register')}>
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
            <LinearGradient colors={[slide.bg[0], slide.bg[1]]} style={[styles.illustration, { height: illustrationHeight }]}>
              <Character pose={slide.pose} size={illustrationHeight * 0.78} />
            </LinearGradient>
            <Text style={styles.eyebrow}>{slide.eyebrow}</Text>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.body}>{slide.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <PrimaryButton
          label={index === SLIDES.length - 1 ? 'はじめる' : 'つぎへ'}
          icon={null}
          onPress={goNext}
          style={{ minWidth: 140 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  skip: { position: 'absolute', right: spacing.lg, zIndex: 10, padding: spacing.sm },
  skipText: { color: colors.textMuted, fontSize: 14 },
  slide: { paddingHorizontal: spacing.lg },
  illustration: {
    width: '100%',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  eyebrow: { color: colors.primary, fontWeight: '800', fontSize: 12, letterSpacing: 1.5, marginBottom: spacing.sm },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, lineHeight: 36, marginBottom: spacing.md },
  body: { fontSize: 15, color: colors.textSecondary, lineHeight: 24 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { width: 20, backgroundColor: colors.primary },
});

