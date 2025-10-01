// Example: ResponsiveTopTabBarDemo.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import TopTabBar, { TopTabItem } from '../components/TabBar/TopTabBar';
import { deviceInfo, getCurrentBreakpoint } from '../utils/responsive';

const ResponsiveTopTabBarDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tab1');
  const [showSidebar, setShowSidebar] = useState(false);

  // Demo với nhiều tabs khác nhau
  const shortTabs: TopTabItem[] = [
    { key: 'tab1', title: 'Home' },
    { key: 'tab2', title: 'Profile' },
    { key: 'tab3', title: 'Settings' },
  ];

  const mediumTabs: TopTabItem[] = [
    { key: 'tab1', title: 'Dashboard' },
    { key: 'tab2', title: 'Projects' },
    { key: 'tab3', title: 'Team' },
    { key: 'tab4', title: 'Reports' },
    { key: 'tab5', title: 'Settings' },
  ];

  const longTabs: TopTabItem[] = [
    { key: 'tab1', title: 'Overview' },
    { key: 'tab2', title: 'Analytics' },
    { key: 'tab3', title: 'Performance' },
    { key: 'tab4', title: 'User Management' },
    { key: 'tab5', title: 'Content Management' },
    { key: 'tab6', title: 'System Settings' },
    { key: 'tab7', title: 'Security' },
    { key: 'tab8', title: 'Integrations' },
  ];

  const veryLongTabTitles: TopTabItem[] = [
    { key: 'tab1', title: 'Customer Relationship Management' },
    { key: 'tab2', title: 'Enterprise Resource Planning' },
    { key: 'tab3', title: 'Business Intelligence & Analytics' },
    { key: 'tab4', title: 'Human Resources Management' },
  ];

  const [currentTabs, setCurrentTabs] = useState(mediumTabs);
  const [currentTitle, setCurrentTitle] = useState('Medium Tabs (5 items)');

  const handleMenuPress = () => {
    setShowSidebar(!showSidebar);
  };

  const switchTabSet = (tabs: TopTabItem[], title: string) => {
    setCurrentTabs(tabs);
    setCurrentTitle(title);
    setActiveTab(tabs[0]?.key || 'tab1');
  };

  return (
    <View style={styles.container}>
      <TopTabBar
        tabs={currentTabs}
        activeTab={activeTab}
        onTabPress={setActiveTab}
        onMenuPress={handleMenuPress}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Responsive TopTabBar Demo</Text>
        <Text style={styles.subtitle}>Current: {currentTitle}</Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Device Information:</Text>
          <Text style={styles.infoText}>Screen Size: {deviceInfo.width} x {deviceInfo.height}</Text>
          <Text style={styles.infoText}>Breakpoint: {getCurrentBreakpoint()}</Text>
          <Text style={styles.infoText}>Device Type: {deviceInfo.isTablet ? 'Tablet' : 'Phone'}</Text>
          <Text style={styles.infoText}>Orientation: {deviceInfo.isPortrait ? 'Portrait' : 'Landscape'}</Text>
          <Text style={styles.infoText}>Platform: {deviceInfo.isIOS ? 'iOS' : 'Android'}</Text>
        </View>

        <View style={styles.demoButtons}>
          <Text style={styles.demoTitle}>Try Different Tab Configurations:</Text>
          
          <View style={styles.buttonRow}>
            <Text 
              style={styles.demoButton} 
              onPress={() => switchTabSet(shortTabs, 'Short Tabs (3 items)')}
            >
              Short Tabs (3)
            </Text>
            <Text 
              style={styles.demoButton} 
              onPress={() => switchTabSet(mediumTabs, 'Medium Tabs (5 items)')}
            >
              Medium Tabs (5)
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <Text 
              style={styles.demoButton} 
              onPress={() => switchTabSet(longTabs, 'Long Tabs (8 items)')}
            >
              Long Tabs (8)
            </Text>
            <Text 
              style={styles.demoButton} 
              onPress={() => switchTabSet(veryLongTabTitles, 'Very Long Titles (4 items)')}
            >
              Long Titles (4)
            </Text>
          </View>
        </View>

        <View style={styles.activeTabContent}>
          <Text style={styles.activeTabTitle}>Active Tab: {activeTab}</Text>
          <Text style={styles.activeTabDesc}>
            This content changes based on the selected tab. The TopTabBar automatically adapts to different screen sizes and tab configurations.
          </Text>
          
          {showSidebar && (
            <View style={styles.sidebarIndicator}>
              <Text style={styles.sidebarText}>📱 Sidebar would be open here</Text>
            </View>
          )}
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Responsive Features:</Text>
          <Text style={styles.featureItem}>✅ Auto-scrollable on small screens</Text>
          <Text style={styles.featureItem}>✅ Dynamic font sizing</Text>
          <Text style={styles.featureItem}>✅ Adaptive padding and margins</Text>
          <Text style={styles.featureItem}>✅ Orientation-aware layout</Text>
          <Text style={styles.featureItem}>✅ Text truncation for long titles</Text>
          <Text style={styles.featureItem}>✅ Breakpoint-based styling</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  demoButtons: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  demoButton: {
    backgroundColor: '#007AFF',
    color: 'white',
    padding: 12,
    borderRadius: 6,
    textAlign: 'center',
    flex: 0.48,
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabContent: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  activeTabTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#007AFF',
  },
  activeTabDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  sidebarIndicator: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  sidebarText: {
    color: '#1976d2',
    fontWeight: '600',
  },
  featuresContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  featureItem: {
    fontSize: 14,
    marginBottom: 6,
    color: '#666',
    lineHeight: 20,
  },
});

export default ResponsiveTopTabBarDemo;