// src/examples/ResponsiveExample.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { 
  wp, hp, fs, ss, deviceInfo, 
  typography, spacing, borderRadius, touchTargets,
  getResponsiveValue 
} from '../utils';
import { globalStyles, colors } from '../styles';

const ResponsiveExample = () => {
  return (
    <ScrollView style={globalStyles.container}>
      {/* Header */}
      <View style={[globalStyles.pMD, globalStyles.bgBlue]}>
        <Text style={[globalStyles.text2XL, globalStyles.textInverse, globalStyles.fontBold, globalStyles.textCenter]}>
          Responsive Design System
        </Text>
      </View>

      {/* Device Info */}
      <View style={[globalStyles.card, globalStyles.mMD]}>
        <Text style={[globalStyles.textLG, globalStyles.fontSemibold, globalStyles.textBlue]}>
          Device Information
        </Text>
        <View style={globalStyles.myMD}>
          <Text style={globalStyles.textBase}>Screen: {deviceInfo.width} x {deviceInfo.height}</Text>
          <Text style={globalStyles.textBase}>Type: {deviceInfo.isTablet ? 'Tablet' : 'Phone'}</Text>
          <Text style={globalStyles.textBase}>Size: {deviceInfo.isSmall ? 'Small' : deviceInfo.isMedium ? 'Medium' : 'Large'}</Text>
          <Text style={globalStyles.textBase}>Platform: {deviceInfo.isIOS ? 'iOS' : 'Android'}</Text>
        </View>
      </View>

      {/* Typography Scale */}
      <View style={[globalStyles.card, globalStyles.mMD]}>
        <Text style={[globalStyles.textLG, globalStyles.fontSemibold, globalStyles.textBlue]}>
          Typography Scale
        </Text>
        <View style={globalStyles.myMD}>
          <Text style={[globalStyles.textXS]}>Extra Small Text - {typography.xs}px</Text>
          <Text style={[globalStyles.textSM]}>Small Text - {typography.sm}px</Text>
          <Text style={[globalStyles.textBase]}>Base Text - {typography.base}px</Text>
          <Text style={[globalStyles.textMD]}>Medium Text - {typography.md}px</Text>
          <Text style={[globalStyles.textLG]}>Large Text - {typography.lg}px</Text>
          <Text style={[globalStyles.textXL]}>Extra Large Text - {typography.xl}px</Text>
          <Text style={[globalStyles.text2XL]}>2XL Text - {typography['2xl']}px</Text>
        </View>
      </View>

      {/* Spacing Scale */}
      <View style={[globalStyles.card, globalStyles.mMD]}>
        <Text style={[globalStyles.textLG, globalStyles.fontSemibold, globalStyles.textBlue]}>
          Spacing Scale
        </Text>
        <View style={globalStyles.myMD}>
          {Object.entries(spacing).map(([key, value]) => (
            <View key={key} style={[
              { 
                backgroundColor: colors.gray100, 
                marginBottom: spacing.xs,
                padding: value,
                borderRadius: borderRadius.sm
              }
            ]}>
              <Text style={globalStyles.textSM}>
                {key}: {value}px padding
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Button Sizes */}
      <View style={[globalStyles.card, globalStyles.mMD]}>
        <Text style={[globalStyles.textLG, globalStyles.fontSemibold, globalStyles.textBlue]}>
          Button Sizes
        </Text>
        <View style={globalStyles.myMD}>
          <TouchableOpacity style={[
            globalStyles.button,
            globalStyles.buttonPrimary,
            { height: touchTargets.small, marginBottom: spacing.sm }
          ]}>
            <Text style={[globalStyles.buttonTextPrimary, { fontSize: typography.sm }]}>
              Small Button
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[
            globalStyles.button,
            globalStyles.buttonPrimary,
            { marginBottom: spacing.sm }
          ]}>
            <Text style={globalStyles.buttonTextPrimary}>
              Medium Button
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[
            globalStyles.button,
            globalStyles.buttonPrimary,
            { height: touchTargets.large }
          ]}>
            <Text style={[globalStyles.buttonTextPrimary, { fontSize: typography.md }]}>
              Large Button
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Responsive Values */}
      <View style={[globalStyles.card, globalStyles.mMD]}>
        <Text style={[globalStyles.textLG, globalStyles.fontSemibold, globalStyles.textBlue]}>
          Responsive Values
        </Text>
        <View style={globalStyles.myMD}>
          <Text style={globalStyles.textBase}>wp(50): {wp(50)}px</Text>
          <Text style={globalStyles.textBase}>hp(10): {hp(10)}px</Text>
          <Text style={globalStyles.textBase}>fs(16): {fs(16)}px</Text>
          <Text style={globalStyles.textBase}>ss(20): {ss(20)}px</Text>
        </View>
      </View>

      {/* Responsive Grid */}
      <View style={[globalStyles.card, globalStyles.mMD]}>
        <Text style={[globalStyles.textLG, globalStyles.fontSemibold, globalStyles.textBlue]}>
          Responsive Grid
        </Text>
        <View style={[
          globalStyles.flexRow, 
          { flexWrap: 'wrap', marginTop: spacing.md }
        ]}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <View key={item} style={[
              {
                width: getResponsiveValue({
                  xs: wp(100),
                  sm: wp(50),
                  lg: wp(33.33),
                  xl: wp(25),
                }) - spacing.sm,
                height: ss(80),
                backgroundColor: colors.primary,
                borderRadius: borderRadius.md,
                margin: spacing.xs,
                justifyContent: 'center',
                alignItems: 'center',
              }
            ]}>
              <Text style={[globalStyles.textInverse, globalStyles.fontBold]}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Safe area */}
      <View style={{ height: hp(5) }} />
    </ScrollView>
  );
};

export default ResponsiveExample;