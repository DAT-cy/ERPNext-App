/**
 * Navigation Helper Utilities
 * Provides reusable navigation functions for feature cards
 */

import { useNavigation } from '@react-navigation/native';
import { SubMenuItemDef } from './menuPermissions';

export interface NavigationFeature extends SubMenuItemDef {
  description?: string;
  backgroundColor?: string;
}

/**
 * Hook for handling feature navigation
 */
export const useFeatureNavigation = () => {
  const navigation = useNavigation();

  const handleNavigateToFeature = (feature: NavigationFeature) => {
    // Handle navigation based on feature ID
    switch (feature.id) {
      case 'stock-entry':
        navigation.navigate('InventoryEntry' as never);
        break;
      
      case 'stock-reconciliation':
        // Navigate to stock reconciliation
        navigation.navigate('StockReconciliation' as never);
        break;
        
      case 'material-request':
        // Navigate to material request
        navigation.navigate('MaterialRequest' as never);
        break;
        
      case 'delivery-note':
        // Navigate to delivery note
        navigation.navigate('DeliveryNote' as never);
        break;
        
      case 'check-quantity-inventory':
        // Navigate to check list inventory
        console.log('🔍 [navigationHelpers] Navigating to CheckListInventoryScreen');
        navigation.navigate('CheckListInventoryScreen' as never);
        break;
        
      case 'purchase-receipt':
        // Navigate to purchase receipt
        navigation.navigate('PurchaseReceiptList' as never);
        break;

      case 'apply-hr':
        // Navigate to leave application
        navigation.navigate('ApplicationLeave' as never);
        break;
        
      default:
        // Default navigation or show not implemented message
        console.warn(`Navigation not implemented for feature: ${feature.id}`);
        break;
    }
  };

  return handleNavigateToFeature;
};

/**
 * Direct navigation function for use outside of React components
 */
export const navigateToFeature = (feature: NavigationFeature, navigation: any) => {
  switch (feature.id) {
    case 'stock-entry':
      navigation.navigate('InventoryEntry');
      break;
    
    case 'stock-reconciliation':
      navigation.navigate('StockReconciliation');
      break;
      
    case 'material-request':
      navigation.navigate('MaterialRequest');
      break;
      
    case 'delivery-note':
      navigation.navigate('DeliveryNote');
      break;
      
    case 'check-quantity-inventory':
      navigation.navigate('CheckListInventoryScreen');
      break;
      
    case 'purchase-receipt':
      navigation.navigate('PurchaseReceiptList');
      break;

    case 'apply-hr':
      navigation.navigate('ApplicationLeave');
      break;
      
    default:
      console.warn(`Navigation not implemented for feature: ${feature.id}`);
      break;
  }
};