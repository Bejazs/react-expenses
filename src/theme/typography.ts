import { TextStyle } from 'react-native';

/**
 * Font families loaded in App.tsx. Weights are picked by family name,
 * so styles never set `fontWeight` (Android would ignore the custom font).
 */
export const fonts = {
  display: 'Fredoka_600SemiBold',
  body: 'NunitoSans_400Regular',
  bodySemiBold: 'NunitoSans_600SemiBold',
  bodyBold: 'NunitoSans_700Bold',
};

export const typography = {
  title: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34 },
  heading: { fontFamily: fonts.display, fontSize: 20, lineHeight: 26 },
  moneyLarge: { fontFamily: fonts.display, fontSize: 40, lineHeight: 48 },
  money: { fontFamily: fonts.display, fontSize: 20, lineHeight: 26 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 22 },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16 },
} satisfies Record<string, TextStyle>;
