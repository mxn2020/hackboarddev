import { User } from '../types';

/**
 * Helper function to test if the user profile update works correctly
 * This can be called from developer tools console or a test component
 */
export const testProfileUpdate = async (
  updateUserFn: (userData: Partial<User>) => Promise<User | undefined>,
  currentUser?: User | null
) => {
  if (!currentUser) {
    console.error('No user is currently logged in. Test cannot proceed.');
    return {
      success: false,
      message: 'No user is currently logged in'
    };
  }

  const testName = `${currentUser.name || currentUser.username} (Test Update ${new Date().toISOString().slice(0, 10)})`;
  
  console.log(`Testing profile update with name: ${testName}`);
  
  try {
    const updatedUser = await updateUserFn({
      name: testName
    });
    
    if (!updatedUser) {
      return {
        success: false,
        message: 'Update function returned undefined',
        originalValue: currentUser.name
      };
    }
    
    const success = updatedUser.name === testName;
    
    return {
      success,
      message: success 
        ? `Profile update successful! Name changed to "${testName}"`
        : `Profile update failed. Expected "${testName}" but got "${updatedUser.name || 'undefined'}"`,
      originalValue: currentUser.name,
      newValue: updatedUser.name
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Error during profile update test: ${error.message || 'Unknown error'}`,
      originalValue: currentUser.name,
      error
    };
  }
};

/**
 * Helper function to test if the browser viewport matches mobile requirements
 * Returns viewport information and if it's considered mobile
 */
export const testViewportSize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isMobile = width < 768; // Common breakpoint for mobile devices
  
  return {
    width,
    height,
    isMobile,
    breakpoints: {
      sm: width >= 640,
      md: width >= 768,
      lg: width >= 1024,
      xl: width >= 1280,
      '2xl': width >= 1536
    }
  };
};

/**
 * Helper function to test navigation between sidebar and header layouts
 */
export const testNavigationLayout = (
  user: User | null | undefined,
  updateUserFn: (userData: Partial<User>) => Promise<User | undefined>
) => {
  if (!user) {
    return {
      success: false,
      message: 'No user is currently logged in. Test cannot proceed.'
    };
  }

  const currentLayout = user.preferences?.menuLayout || 'sidebar';
  const newLayout = currentLayout === 'sidebar' ? 'header' : 'sidebar';

  return {
    currentLayout,
    newLayout,
    switchLayout: async () => {
      try {
        const updatedUser = await updateUserFn({
          preferences: {
            ...user.preferences,
            menuLayout: newLayout
          }
        });
        
        return {
          success: Boolean(updatedUser),
          previousLayout: currentLayout,
          currentLayout: updatedUser?.preferences?.menuLayout || currentLayout,
          message: updatedUser 
            ? `Successfully switched layout to ${updatedUser.preferences?.menuLayout}`
            : 'Failed to update layout preference'
        };
      } catch (error: any) {
        return {
          success: false,
          previousLayout: currentLayout,
          currentLayout,
          message: `Error switching layout: ${error.message || 'Unknown error'}`
        };
      }
    }
  };
};
