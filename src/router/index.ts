// src/router/index.ts
export { default as menuRouter } from './MenuRouter';
export { RouteNames, MENU_ROUTE_MAP } from './MenuRouter';
export { default as menuRouterController } from './MenuRouterController';

// Re-export navigationRef để dễ dàng import
export { navigationRef } from './MenuRouter';

// Exports từ ScreenNavigator
export { screenNavigator, useScreenNavigator, withScreenNavigation } from './ScreenNavigator';