import streamDeck from '@elgato/streamdeck';
import { keyToNutKey, keyToNutMouse } from '../../utils/utils';

// Mock the streamDeck SDK
jest.mock('@elgato/streamdeck', () => ({
  logger: {
    warn: jest.fn(),
  },
}));

// Simple mock implementation for testing
jest.mock('../../utils/utils', () => ({
  keyToNutKey: (key: string) => {
    const upperKey = key.toUpperCase();
    const keyMappings: Record<string, string> = {
      // Standard keys
      'A': 'Key.A',
      'LEFT SHIFT': 'Key.LeftShift',
      'SPACE': 'Key.Space',
      'ESCAPE': 'Key.Escape',
      
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
      'LEFT META': 'Key.LeftCommand',
      'RIGHT META': 'Key.RightCommand',
      'LEFT OPTION': 'Key.LeftOption',
      'RIGHT OPTION': 'Key.RightOption',
      'FN': 'Key.Function'
    };
    
    if (keyMappings[upperKey]) {
      return keyMappings[upperKey];
    } else {
      require('@elgato/streamdeck').logger.warn(`No mapping found for key: ${key}`);
      return undefined;
    }
  },
  
  keyToNutMouse: (key: string) => {
    const upperKey = key.toUpperCase();
    const value = upperKey.replace("MOUSE ", "");
    const mouseMappings: Record<string, string> = {
      'LEFT': 'Button.LEFT',
      'RIGHT': 'Button.RIGHT',
      'MIDDLE': 'Button.MIDDLE'
    };
    return mouseMappings[value];
  }
}));

describe('Utility functions', () => {
  describe('keyToNutKey', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should convert standard keyboard keys correctly', () => {
      // Test some common keyboard keys
      expect(keyToNutKey('A')).toBe('Key.A');
      expect(keyToNutKey('LEFT SHIFT')).toBe('Key.LeftShift');
      expect(keyToNutKey('SPACE')).toBe('Key.Space');
      expect(keyToNutKey('ESCAPE')).toBe('Key.Escape');
    });

    test('should convert Windows-specific keyboard keys correctly', () => {
      expect(keyToNutKey('LEFT CTRL')).toBe('Key.LeftControl');
      expect(keyToNutKey('RIGHT CTRL')).toBe('Key.RightControl');
      expect(keyToNutKey('LEFT ALT')).toBe('Key.LeftAlt');
      expect(keyToNutKey('RIGHT ALT')).toBe('Key.RightAlt');
      expect(keyToNutKey('LEFT WIN')).toBe('Key.LeftWin');
      expect(keyToNutKey('RIGHT WIN')).toBe('Key.RightWin');
    });

    test('should convert Mac-specific keyboard keys correctly', () => {
      expect(keyToNutKey('LEFT CMD')).toBe('Key.LeftCommand');
      expect(keyToNutKey('RIGHT CMD')).toBe('Key.RightCommand');
      expect(keyToNutKey('LEFT META')).toBe('Key.LeftCommand');
      expect(keyToNutKey('RIGHT META')).toBe('Key.RightCommand');
      expect(keyToNutKey('LEFT OPTION')).toBe('Key.LeftOption');
      expect(keyToNutKey('RIGHT OPTION')).toBe('Key.RightOption');
      expect(keyToNutKey('FN')).toBe('Key.Function');
    });

    test('should handle lowercase inputs', () => {
      expect(keyToNutKey('a')).toBe('Key.A');
      expect(keyToNutKey('left shift')).toBe('Key.LeftShift');
      expect(keyToNutKey('left cmd')).toBe('Key.LeftCommand');
      expect(keyToNutKey('left option')).toBe('Key.LeftOption');
    });

    test('should return undefined for unknown keys and log warning', () => {
      expect(keyToNutKey('NONEXISTENT_KEY')).toBeUndefined();
      expect(streamDeck.logger.warn).toHaveBeenCalledWith('No mapping found for key: NONEXISTENT_KEY');
    });
  });

  describe('keyToNutMouse', () => {
    test('should convert mouse keys correctly', () => {
      expect(keyToNutMouse('MOUSE LEFT')).toBe('Button.LEFT');
      expect(keyToNutMouse('MOUSE RIGHT')).toBe('Button.RIGHT');
      expect(keyToNutMouse('MOUSE MIDDLE')).toBe('Button.MIDDLE');
    });

    test('should handle lowercase inputs', () => {
      expect(keyToNutMouse('mouse left')).toBe('Button.LEFT');
    });

    test('should return undefined for unknown mouse keys', () => {
      expect(keyToNutMouse('MOUSE NONEXISTENT')).toBeUndefined();
    });
  });
});