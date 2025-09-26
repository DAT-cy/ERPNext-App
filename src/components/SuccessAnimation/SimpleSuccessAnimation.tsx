// src/components/SuccessAnimation/SimpleSuccessAnimation.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';

interface SimpleSuccessAnimationProps {
  isVisible: boolean;
  message: string;
  onAnimationComplete?: () => void;
}

const SimpleSuccessAnimation: React.FC<SimpleSuccessAnimationProps> = ({
  isVisible,
  message,
  onAnimationComplete
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (isVisible) {
      
      // Reset animation values
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.5);
      
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after 2.5 seconds
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.5,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        });
      }, 2500);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        opacity: fadeAnim,
      }}
    >
      <Animated.View
        style={{
          backgroundColor: 'white',
          borderRadius: 20,
          padding: 30,
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 250,
          transform: [{ scale: scaleAnim }],
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.25,
          shadowRadius: 20,
          elevation: 10,
        }}
      >
        {/* Checkmark */}
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#4CAF50',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 36, color: 'white', fontWeight: 'bold' }}>
            ✓
          </Text>
        </View>

        {/* Title */}
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#333',
            marginBottom: 10,
            textAlign: 'center',
          }}
        >
          Thành công!
        </Text>

        {/* Message */}
        <Text
          style={{
            fontSize: 16,
            color: '#666',
            textAlign: 'center',
            lineHeight: 22,
          }}
        >
          {message}
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

export default SimpleSuccessAnimation;