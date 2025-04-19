// This is a mock version of the utils.ts file for testing purposes

// Create mock mapping objects
const keyMappings: { [key: string]: string } = {
  // Standard keys
  'A': 'Key.A',
  'B': 'Key.B',
  'LEFT SHIFT': 'Key.LeftShift',
  'RIGHT SHIFT': 'Key.RightShift',
  'SPACE': 'Key.Space',
  'ESCAPE': 'Key.Escape',
  'ENTER': 'Key.Enter',
  
  // Windows specific keys
  'LEFT CTRL': 'Key.LeftControl',
  'RIGHT CTRL': 'Key.RightControl',
  'LEFT ALT': 'Key.LeftAlt', 
  'RIGHT ALT': 'Key.RightAlt',
  'LEFT WIN': 'Key.LeftWin',
  'RIGHT WIN': 'Key.RightWin',
  
  // Mac specific keys
  'LEFT CMD': 'Key.LeftCommand',
  'RIGHT CMD': 'Key.RightCommand',
  'LEFT META': 'Key.LeftCommand', // Alias for Command
  'RIGHT META': 'Key.RightCommand', // Alias for Command
  'LEFT SUPER': 'Key.LeftSuper', // Usually maps to Command on Mac
  'RIGHT SUPER': 'Key.RightSuper',
  'LEFT OPTION': 'Key.LeftOption',
  'RIGHT OPTION': 'Key.RightOption',
  'FN': 'Key.Function',
};

const mouseMappings: { [key: string]: string } = {
  'LEFT': 'Button.LEFT',
  'RIGHT': 'Button.RIGHT',
  'MIDDLE': 'Button.MIDDLE',
};

export const keyToNutKey = (key: string): string | undefined => {
  const upperKey = key.toUpperCase();
  if (keyMappings[upperKey]) {
    return keyMappings[upperKey];
  } else {
    return undefined;
  }
};

export const keyToNutMouse = (key: string): string | undefined => {
  const upperKey = key.toUpperCase();
  const value = upperKey.replace('MOUSE ', '');
  return mouseMappings[value];
};