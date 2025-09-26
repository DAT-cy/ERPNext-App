// src/components/SuccessAnimation/SuccessAnimation.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { successAnimationStyles } from '../../styles/SuccessAnimation.styles';

interface SuccessAnimationProps {
  isVisible: boolean;
  message: string;
  onAnimationComplete?: () => void;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  isVisible,
  message,
  onAnimationComplete
}) => {
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    console.log('🎬 SuccessAnimation useEffect triggered, isVisible:', isVisible);
    if (isVisible) {
      console.log('🎭 Starting success animation sequence...');
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0);
      checkmarkAnim.setValue(0);
      slideAnim.setValue(50);

      // Start animation sequence
      Animated.sequence([
        // 1. Fade in background
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        // 2. Scale in container
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // 3. Animate checkmark and slide in text
        Animated.parallel([
          Animated.spring(checkmarkAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        // 4. Hold for a moment
        Animated.delay(1500),
        // 5. Fade out
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ]).start(() => {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      });
    }
  }, [isVisible, fadeAnim, scaleAnim, checkmarkAnim, slideAnim, onAnimationComplete]);

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        successAnimationStyles.overlay,
        {
          opacity: fadeAnim,
        }
      ]}
    >
      <Animated.View
        style={[
          successAnimationStyles.container,
          {
            transform: [
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        {/* Checkmark Icon */}
        <Animated.View
          style={[
            successAnimationStyles.checkmarkContainer,
            {
              transform: [
                { 
                  scale: checkmarkAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 1.2, 1]
                  })
                },
                {
                  rotate: checkmarkAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })
                }
              ]
            }
          ]}
        >
          <View style={successAnimationStyles.checkmark}>
            <Text style={successAnimationStyles.checkmarkText}>✓</Text>
          </View>
        </Animated.View>

        {/* Success Message */}
        <Animated.View
          style={[
            successAnimationStyles.messageContainer,
            {
              transform: [
                { translateY: slideAnim }
              ],
              opacity: checkmarkAnim
            }
          ]}
        >
          <Text style={successAnimationStyles.title}>Thành công!</Text>
          <Text style={successAnimationStyles.message}>{message}</Text>
        </Animated.View>

        {/* Ripple Effect */}
        <Animated.View
          style={[
            successAnimationStyles.ripple,
            {
              transform: [
                {
                  scale: checkmarkAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 3]
                  })
                }
              ],
              opacity: checkmarkAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.5, 0.3, 0]
              })
            }
          ]}
        />
      </Animated.View>
    </Animated.View>
  );
};

export default SuccessAnimation;