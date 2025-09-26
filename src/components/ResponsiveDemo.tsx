// src/components/ResponsiveDemo.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { wp, hp, fs, ss, deviceInfo, typography, spacing, borderRadius, touchTargets } from '../utils';
import { globalStyles, colors } from '../styles';

interface ResponsiveDemoProps {
  title?: string;
}

const ResponsiveDemo: React.FC<ResponsiveDemoProps> = ({ title = 'Responsive Demo' }) => {
  return (
    <ScrollView style={globalStyles.container}>
      {/* Header */}
      <View style={[globalStyles.pMD, { backgroundColor: colors.primary }]}>
        <Text style={[globalStyles.textXL, { color: colors.textInverse }, globalStyles.fontBold]}>
          {title}
        </Text>
        <Text style={[globalStyles.textSM, { color: colors.textInverse }]}>
          Screen: {deviceInfo.width}x{deviceInfo.height} • {deviceInfo.isTablet ? 'Tablet' : 'Phone'}
        </Text>
      </View>

      {/* Responsive Grid */}
      <View style={[globalStyles.pMD]}>
        <Text style={[globalStyles.textLG, globalStyles.fontSemibold, globalStyles.mMD]}>
          Responsive Grid
        </Text>
        
        <View style={[globalStyles.flexRow, { flexWrap: 'wrap' }]}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <View
              key={item}
              style={[
                {
                  width: deviceInfo.isTablet ? wp(25) - spacing.sm : wp(50) - spacing.sm,
                  height: ss(100),
                  backgroundColor: colors.primary,
                  borderRadius: borderRadius.md,
                  margin: spacing.xs,
                  justifyContent: 'center',
                  alignItems: 'center',
                }
              ]}
            >
              <Text style={[globalStyles.fontBold, { color: colors.textInverse, fontSize: fs(16) }]}>
                {item}
              </Text>
            </View>
          ))}
        </View>

        {/* Typography Scale */}
        <Text style={[globalStyles.textLG, globalStyles.fontSemibold, globalStyles.mMD]}>
          Typography Scale
        </Text>
        
        <View style={[globalStyles.card, globalStyles.mSM]}>
          <Text style={globalStyles.textXS}>Extra Small - {fs(typography.xs)}px</Text>
          <Text style={globalStyles.textSM}>Small - {fs(typography.sm)}px</Text>
          <Text style={globalStyles.textBase}>Base - {fs(typography.base)}px</Text>
          <Text style={globalStyles.textMD}>Medium - {fs(typography.md)}px</Text>
          <Text style={globalStyles.textLG}>Large - {fs(typography.lg)}px</Text>
          <Text style={globalStyles.textXL}>Extra Large - {fs(typography.xl)}px</Text>
          <Text style={globalStyles.text2XL}>2XL - {fs(typography['2xl'])}px</Text>
        </View>

        {/* Buttons */}
        <Text style={[globalStyles.textLG, globalStyles.fontSemibold, globalStyles.mMD]}>
          Responsive Buttons
        </Text>
        
        <TouchableOpacity style={[
          globalStyles.button,
          globalStyles.buttonPrimary,
          { height: touchTargets.small, marginBottom: spacing.sm }
        ]}>
          <Text style={[globalStyles.buttonTextPrimary, { fontSize: fs(14) }]}>
            Small Button
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[
          globalStyles.button,
          globalStyles.buttonPrimary,
          { marginBottom: spacing.sm }
        ]}>
          <Text style={globalStyles.buttonTextPrimary}>
            Default Button
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[
          globalStyles.button,
          globalStyles.buttonPrimary,
          { height: touchTargets.large }
        ]}>
          <Text style={[globalStyles.buttonTextPrimary, { fontSize: fs(18) }]}>
            Large Button
          </Text>
        </TouchableOpacity>

        {/* Device Info */}
        <Text style={[globalStyles.textLG, globalStyles.fontSemibold, globalStyles.mMD]}>
          Device Information
        </Text>
        
        <View style={[globalStyles.card, globalStyles.mSM]}>
          <Text style={globalStyles.textBase}>Width: {deviceInfo.width}px ({wp(100)})</Text>
          <Text style={globalStyles.textBase}>Height: {deviceInfo.height}px ({hp(100)})</Text>
          <Text style={globalStyles.textBase}>Is Tablet: {deviceInfo.isTablet ? 'Yes' : 'No'}</Text>
          <Text style={globalStyles.textBase}>Platform: {deviceInfo.isIOS ? 'iOS' : 'Android'}</Text>
          <Text style={globalStyles.textBase}>Font Scale: {deviceInfo.fontScale}</Text>
          <Text style={globalStyles.textBase}>Pixel Ratio: {deviceInfo.pixelRatio}</Text>
        </View>

        {/* Spacing Examples */}
        <Text style={[globalStyles.textLG, globalStyles.fontSemibold, globalStyles.mMD]}>
          Spacing Scale
        </Text>
        
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

        {/* Safe area for bottom */}
        <View style={{ height: hp(5) }} />
      </View>
    </ScrollView>
  );
};

export default ResponsiveDemo;