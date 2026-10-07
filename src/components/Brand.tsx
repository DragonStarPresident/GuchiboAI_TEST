import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

const LOGO = require('../../assets/images/logo.png');
const CHARACTERS = {
  wave: require('../../assets/images/chara-wave.png'),
  pray: require('../../assets/images/chara-pray.png'),
  heart: require('../../assets/images/chara-heart.png'),
} as const;

export type CharacterPose = keyof typeof CHARACTERS;

// アプリアイコンと同じ、吹き出しの顔のロゴ
export function Logo({ size = 64, style }: { size?: number; style?: StyleProp<ImageStyle> }) {
  return <Image source={LOGO} style={[{ width: size, height: size }, style]} resizeMode="contain" />;
}

// キャラクター（手を振る／手を組む／ハートを抱える）
export function Character({
  pose,
  size = 160,
  style,
}: {
  pose: CharacterPose;
  size?: number;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image source={CHARACTERS[pose]} style={[{ width: size, height: size }, style]} resizeMode="contain" />
  );
}
