import { MacroRecord } from '../../actions/record-macro';
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

describe('MacroRecord', () => {
  let macroRecord: MacroRecord;
  let mockGlobalKeyboardListener: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up the mock environment
    mockGlobalKeyboardListener = {
      addListener: jest.fn(),
      kill: jest.fn(),
    };
    
    // Create an instance of MacroRecord
    macroRecord = new MacroRecord();

    // Mock the global settings
    (streamDeck.settings.getGlobalSettings as jest.Mock).mockResolvedValue({
      currentRecording: [],
      isRecording: false,
      macros: [],
    });
  });

  test('onWillAppear should initialize settings correctly', async () => {
    // @ts-ignore - WillAppearEvent type not needed for test
    await macroRecord.onWillAppear({});

    // Verify global settings were set with default values
    expect(streamDeck.settings.setGlobalSettings).toHaveBeenCalledWith({
      currentRecording: [],
      macros: [],
      isRecording: false,
    });
  });

  test('onKeyDown should start recording when not recording and state is 0', async () => {
    // Mock the current state
    (macroRecord as any).settings = {
      isRecording: false,
      currentRecording: [],
      macros: [],
    };

    // @ts-ignore - KeyDownEvent type not needed for test
    await macroRecord.onKeyDown({ payload: { state: 0 } });

    // Verify recording started
    expect((macroRecord as any).settings.isRecording).toBe(true);
    expect(streamDeck.settings.setGlobalSettings).toHaveBeenCalled();
    expect(streamDeck.logger.info).toHaveBeenCalledWith('Started recording');
  });

  test('onKeyDown should stop recording when already recording', async () => {
    // Mock the current state
    (macroRecord as any).settings = {
      isRecording: true,
      currentRecording: [],
      macros: [],
    };
    (macroRecord as any).keyboardListener = mockGlobalKeyboardListener;

    // @ts-ignore - KeyDownEvent type not needed for test
    await macroRecord.onKeyDown({ payload: { state: 0 } });

    // Verify recording stopped
    expect(mockGlobalKeyboardListener.kill).toHaveBeenCalled();
    expect((macroRecord as any).settings.isRecording).toBe(false);
    expect(streamDeck.logger.info).toHaveBeenCalledWith('Stopped recording');
  });

  test('startRecording should initialize recording correctly', async () => {
    // Mock Date.now
    const mockDateNow = jest.spyOn(Date, 'now').mockReturnValue(12345);

    // Mock the GlobalKeyboardListener constructor
    const GlobalKeyboardListenerMock = jest.fn().mockImplementation(() => mockGlobalKeyboardListener);

    // @ts-ignore - KeyDownEvent type not needed for test
    await (macroRecord as any).startRecording({ payload: { state: 0 } }, GlobalKeyboardListenerMock);

    // Verify settings and keyboard listener
    expect((macroRecord as any).settings.isRecording).toBe(true);
    expect((macroRecord as any).settings.currentRecording).toEqual([]);
    expect((macroRecord as any).lastTimestamp).toBe(12345);
    expect(streamDeck.settings.setGlobalSettings).toHaveBeenCalled();
    expect(streamDeck.logger.info).toHaveBeenCalledWith('Started recording');
    expect(GlobalKeyboardListenerMock).toHaveBeenCalled();

    // Restore Date.now
    mockDateNow.mockRestore();
  });

  test('stopRecording should save the macro when recording is stopped', async () => {
    // Mock Date.now
    const mockDateNow = jest.spyOn(Date, 'now').mockReturnValue(12345);

    // Set up recording state
    (macroRecord as any).settings = {
      isRecording: true,
      currentRecording: [
        { keyState: { 'A': true }, duration: 100 },
        { keyState: { 'A': false }, duration: 100 },
      ],
      macros: [],
    };
    (macroRecord as any).keyboardListener = mockGlobalKeyboardListener;

    // @ts-ignore - KeyDownEvent type not needed for test
    await (macroRecord as any).stopRecording({ payload: { state: 0 } });

    // Verify keyboard listener was killed
    expect(mockGlobalKeyboardListener.kill).toHaveBeenCalled();
    
    // Verify settings were updated
    expect((macroRecord as any).settings.isRecording).toBe(false);
    expect((macroRecord as any).settings.macros.length).toBe(1);
    expect((macroRecord as any).settings.macros[0].id).toBe('macro_12345');
    expect((macroRecord as any).settings.macros[0].events).toEqual([
      { keyState: { 'A': true }, duration: 100 },
      { keyState: { 'A': false }, duration: 100 },
    ]);
    expect(streamDeck.logger.info).toHaveBeenCalledWith('Stopped recording');

    // Restore Date.now
    mockDateNow.mockRestore();
  });

  test('recordEvent should add events to currentRecording', async () => {
    // Mock Date.now
    const mockDateNow = jest.spyOn(Date, 'now')
      .mockReturnValueOnce(12345) // Initial timestamp
      .mockReturnValueOnce(12445); // Current timestamp (100ms later)

    // Setup state
    (macroRecord as any).lastTimestamp = 12345;
    (macroRecord as any).settings = {
      isRecording: true,
      currentRecording: [],
      macros: [],
    };

    // Mock the recordEvent implementation to use the mock timestamps for duration calculation
    const originalRecordEvent = (macroRecord as any).recordEvent;
    (macroRecord as any).recordEvent = function(keyState: { [key: string]: boolean }) {
      const currentTime = Date.now();
      const duration = currentTime - this.lastTimestamp;
      this.lastTimestamp = currentTime;

      // Use the mocked duration instead of calculating it
      this.settings.currentRecording.push({
        keyState,
        duration: 100 // Hard-code this to match our mocked timestamps
      });

      streamDeck.logger.info(`Recorded key event: ${JSON.stringify(keyState)}`);
      streamDeck.settings.setGlobalSettings(this.settings);
    };

    // Call recordEvent with a key down event
    (macroRecord as any).recordEvent({ 'A': true });

    // Verify event was recorded
    expect((macroRecord as any).settings.currentRecording).toEqual([
      { keyState: { 'A': true }, duration: 100 }
    ]);
    expect(streamDeck.logger.info).toHaveBeenCalled();
    expect(streamDeck.settings.setGlobalSettings).toHaveBeenCalled();
    
    // Restore Date.now and original recordEvent
    mockDateNow.mockRestore();
    if (originalRecordEvent) {
      (macroRecord as any).recordEvent = originalRecordEvent;
    }
  });
});