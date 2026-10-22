import { createNavigationContainerRef } from '@react-navigation/native';
import type { MainTabsParamList } from './main-tabs-param-list';

const navigationRef = createNavigationContainerRef<MainTabsParamList>();

export { navigationRef };
