import { testProfileUpdate, testViewportSize, testNavigationLayout, testPerformance } from './testHelpers';
import { User } from '../types';

interface AppTestWindow extends Window {
  appTests: {
    testProfileUpdate: () => Promise<unknown>;
    testViewportSize: () => unknown;
    testNavigationLayout: () => unknown;
    testPerformance: () => unknown;
    runAllTests: () => Promise<unknown>;
    help: () => void;
  };
}

/**
 * Initialize test commands in the browser console for easy testing
 * @param updateUserFn - The function to update the user
 * @param currentUser - The current logged in user
 */
export const initConsoleTests = (
  updateUserFn: (userData: Partial<User>) => Promise<User | undefined>,
  currentUser: User | null | undefined
) => {
  // Add tests to window object for console access
  if (typeof window !== 'undefined') {
    (window as unknown as AppTestWindow).appTests = {
      testProfileUpdate: () => testProfileUpdate(updateUserFn, currentUser),
      testViewportSize,
      testNavigationLayout: () => testNavigationLayout(currentUser, updateUserFn),
      testPerformance,
      runAllTests: async () => {
        console.group('🧪 Running All Tests');

        console.log('📱 Testing Viewport Size');
        const viewportResult = testViewportSize();
        console.log(viewportResult);

        console.log('🧑‍💼 Testing Profile Update');
        const profileResult = await testProfileUpdate(updateUserFn, currentUser);
        console.log(profileResult);

        console.log('🧭 Testing Navigation Layout');
        const navInfo = testNavigationLayout(currentUser, updateUserFn);
        console.log({
          currentLayout: navInfo.currentLayout,
          newLayout: navInfo.newLayout,
        });

        console.log('⚡ Testing Performance');
        const performanceResult = testPerformance();
        console.log(performanceResult);

        console.groupEnd();

        return {
          viewport: viewportResult,
          profile: profileResult,
          navigation: navInfo,
          performance: performanceResult
        };
      },
      help: () => {
        console.group('🧪 Test Suite Commands');
        console.log('appTests.testProfileUpdate() - Test if profile updates work');
        console.log('appTests.testViewportSize() - Check viewport dimensions and breakpoints');
        console.log('appTests.testNavigationLayout() - Get navigation layout info');
        console.log('appTests.testPerformance() - Measure app performance metrics');
        console.log('appTests.runAllTests() - Run all tests');
        console.groupEnd();
      }
    };

    console.log('%c🧪 App Test Suite Initialized!', 'color: purple; font-weight: bold; font-size: 14px;');
    console.log('Type %cappTests.help()%c to see available commands', 'font-weight: bold; color: blue;', 'font-weight: normal;');
  }
};

export default initConsoleTests;
