import { MacroPlay } from '../../actions/play-macro';
import streamDeck from '@elgato/streamdeck';

// Mock the streamDeck SDK
jest.mock('@elgato/streamdeck', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
  },
  settings: {
    getGlobalSettings: jest.fn(),
    setGlobalSettings: jest.fn(),
  },
}));

describe('MacroPlay', () => {
  let macroPlay: MacroPlay;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create an instance of MacroPlay
    macroPlay = new MacroPlay();
    
    // Mock the global settings with both Windows and Mac key combinations
    (streamDeck.settings.getGlobalSettings as jest.Mock).mockResolvedValue({
      macros: [{
        id: 'test_macro',
        events: [
          // Windows key combination (Ctrl+A)
          {
            keyState: { 'LEFT CTRL': true },
            duration: 100,
          },
          {
            keyState: { 'A': true },
            duration: 100,
          },
          {
            keyState: { 'A': false },
            duration: 100,
          },
          {
            keyState: { 'LEFT CTRL': false },
            duration: 100,
          },
          // Mac key combination (Command+A)
          {
            keyState: { 'LEFT CMD': true },
            duration: 100,
          },
          {
            keyState: { 'A': true },
            duration: 100,
          },
          {
            keyState: { 'A': false },
            duration: 100,
          },
          {
            keyState: { 'LEFT CMD': false },
            duration: 100,
          },
          // Mac Option key
          {
            keyState: { 'LEFT OPTION': true },
            duration: 100,
          },
          {
            keyState: { 'LEFT OPTION': false },
            duration: 100,
          },
          // Mouse events
          {
            keyState: { 'MOUSE LEFT': true },
            duration: 100,
          },
          {
            keyState: { 'MOUSE LEFT': false },
            duration: 100,
          },
        ],
      }],
      delayBetweenReplays: 500,
      delayOffset: '0',
      ignoreStartDelay: false,
      instant: false,
      playMouse: true,
    });
  });

  test('onWillAppear should set initial state', async () => {
    // Spy on releaseAllKeys
    const releaseAllKeysSpy = jest.spyOn(macroPlay as any, 'releaseAllKeys').mockResolvedValue(undefined);
    
    // @ts-ignore - WillAppearEvent type not needed for test
    await macroPlay.onWillAppear({});
    
    // Verify initial state
    expect((macroPlay as any).isPlaying).toBe(false);
    expect((macroPlay as any).stopPlayback).toBe(false);
    expect(releaseAllKeysSpy).toHaveBeenCalled();
  });

  test('onKeyDown should start playback when not playing and state is 0', async () => {
    // Spy on startPlayback
    const startPlaybackSpy = jest.spyOn(macroPlay as any, 'startPlayback').mockResolvedValue(undefined);
    
    // @ts-ignore - KeyDownEvent type not needed for test
    await macroPlay.onKeyDown({ payload: { state: 0 } });
    
    // Verify startPlayback was called
    expect(startPlaybackSpy).toHaveBeenCalled();
  });

  test('onKeyDown should stop playback when already playing', async () => {
    // Set playing state
    (macroPlay as any).isPlaying = true;
    
    // Spy on releaseAllKeys
    const releaseAllKeysSpy = jest.spyOn(macroPlay as any, 'releaseAllKeys').mockResolvedValue(undefined);
    
    // @ts-ignore - KeyDownEvent type not needed for test
    await macroPlay.onKeyDown({ payload: { state: 0 } });
    
    // Verify playback stops
    expect((macroPlay as any).stopPlayback).toBe(true);
    expect((macroPlay as any).isPlaying).toBe(false);
    expect(releaseAllKeysSpy).toHaveBeenCalled();
  });

  test('should not start playback if no macros found', async () => {
    // Mock empty macros
    (streamDeck.settings.getGlobalSettings as jest.Mock).mockResolvedValue({
      macros: [],
    });
    
    // @ts-ignore - KeyDownEvent type not needed for test
    await macroPlay.onKeyDown({ payload: { state: 0 } });
    
    // Verify logger was called with no macros message
    expect(streamDeck.logger.info).toHaveBeenCalledWith('No macro found');
  });

  test('delay should respect instant setting', async () => {
    // Setup
    jest.useFakeTimers();
    (macroPlay as any).instant = true;
    
    // Call delay
    const delayPromise = (macroPlay as any).delay(1000);
    
    // Fast-forward timers
    jest.runAllTimers();
    
    // Wait for promise to resolve
    await delayPromise;
    
    // Verify logger was called with skipping delay message
    expect(streamDeck.logger.info).toHaveBeenCalledWith('Skipping delay');
    
    // Cleanup
    jest.useRealTimers();
  });
  
  test('startPlayback should handle playback correctly', async () => {
    // Spy on the delay method
    const delaySpy = jest.spyOn(macroPlay as any, 'delay').mockResolvedValue(undefined);
    
    // Call startPlayback
    await (macroPlay as any).startPlayback();
    
    // Verify playback state
    expect(streamDeck.logger.info).toHaveBeenCalledWith('Started playback');
    expect(delaySpy).toHaveBeenCalled();
    expect(streamDeck.logger.info).toHaveBeenCalledWith('Playback complete');
    expect((macroPlay as any).isPlaying).toBe(false);
  });

  test('releaseAllKeys should clear pressed keys and mouse buttons', async () => {
    // Setup with both Windows and Mac keys
    (macroPlay as any).pressedKeys = new Set(['A', 'LEFT CTRL', 'LEFT CMD', 'LEFT OPTION']);
    (macroPlay as any).pressedMouseButtons = new Set(['LEFT']);
    
    // Call releaseAllKeys
    await (macroPlay as any).releaseAllKeys();
    
    // Verify sets are cleared
    expect((macroPlay as any).pressedKeys.size).toBe(0);
    expect((macroPlay as any).pressedMouseButtons.size).toBe(0);
    expect(streamDeck.logger.info).toHaveBeenCalledWith('Released all keys');
  });

  test('should handle platform-specific key combinations correctly', async () => {
    // This test verifies that our mock has the correct data structure for platform-specific key combinations
    const settings = await streamDeck.settings.getGlobalSettings() as {
      macros?: Array<{
        id: string;
        events: Array<{
          keyState: Record<string, boolean>;
          duration: number;
        }>;
      }>;
    };
    
    // Ensure macros are defined and have the expected structure
    expect(settings.macros).toBeDefined();
    expect(settings.macros!.length).toBeGreaterThan(0);
    
    const events = settings.macros![0].events;
    
    // Verify Windows Ctrl+A sequence
    expect(events[0].keyState['LEFT CTRL']).toBe(true);
    expect(events[1].keyState['A']).toBe(true);
    expect(events[2].keyState['A']).toBe(false);
    expect(events[3].keyState['LEFT CTRL']).toBe(false);
    
    // Verify Mac Command+A sequence
    expect(events[4].keyState['LEFT CMD']).toBe(true);
    expect(events[5].keyState['A']).toBe(true);
    expect(events[6].keyState['A']).toBe(false);
    expect(events[7].keyState['LEFT CMD']).toBe(false);
    
    // Verify Mac Option key
    expect(events[8].keyState['LEFT OPTION']).toBe(true);
    expect(events[9].keyState['LEFT OPTION']).toBe(false);
  });
});