// hooks/useResponsiveTopTabBar.tsx
import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import { deviceInfo, getResponsiveValue, getCurrentBreakpoint } from '../utils/responsive';

export interface ResponsiveTopTabBarConfig {
  shouldUseScrollable: boolean;
  maxVisibleTabs: number;
  tabMinWidth: number;
  containerPadding: number;
  menuTopMargin: number;
  fontSize: number;
  iconSize: number;
  verticalPadding: number;
  horizontalPadding: number;
}

export const useResponsiveTopTabBar = (tabsCount: number = 0) => {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));
  const [config, setConfig] = useState<ResponsiveTopTabBarConfig>(() => 
    calculateConfig(dimensions, tabsCount)
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setDimensions(window);
      setConfig(calculateConfig(window, tabsCount));
    });

    return () => subscription?.remove();
  }, [tabsCount]);

  // Recalculate when tabs count changes
  useEffect(() => {
    setConfig(calculateConfig(dimensions, tabsCount));
  }, [dimensions, tabsCount]);

  return config;
};

function calculateConfig(dimensions: ScaledSize, tabsCount: number): ResponsiveTopTabBarConfig {
  const { width } = dimensions;
  const currentBreakpoint = getCurrentBreakpoint();
  
  // Responsive values based on screen size
  const containerPadding = getResponsiveValue({
    xs: 12, sm: 16, md: 20, lg: 24, xl: 32
  });

  const menuTopMargin = getResponsiveValue({
    xs: 25, sm: 30, md: 35, lg: 40, xl: 45
  });

  const fontSize = getResponsiveValue({
    xs: 13, sm: 14, md: 15, lg: 16, xl: 18
  });

  const iconSize = getResponsiveValue({
    xs: 18, sm: 20, md: 22, lg: 24, xl: 26
  });

  const verticalPadding = getResponsiveValue({
    xs: 10, sm: 12, md: 14, lg: 16, xl: 18
  });

  const horizontalPadding = getResponsiveValue({
    xs: 6, sm: 8, md: 10, lg: 12, xl: 14
  });

  const tabMinWidth = getResponsiveValue({
    xs: 70, sm: 80, md: 90, lg: 100, xl: 120
  });

  // Calculate max visible tabs based on screen width
  const availableWidth = width - (containerPadding * 2) - 50; // 50 for menu button
  const maxVisibleTabs = Math.floor(availableWidth / tabMinWidth);

  // Determine if should use scrollable
  const shouldUseScrollable = (
    tabsCount > maxVisibleTabs || 
    tabsCount > 4 || 
    currentBreakpoint === 'xs' ||
    (currentBreakpoint === 'sm' && tabsCount > 3)
  );

  return {
    shouldUseScrollable,
    maxVisibleTabs,
    tabMinWidth,
    containerPadding,
    menuTopMargin,
    fontSize,
    iconSize,
    verticalPadding,
    horizontalPadding,
  };
}