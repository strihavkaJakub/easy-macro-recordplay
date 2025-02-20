import streamDeck, { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { EventType, MacroEvent, MacroSettings } from "../model/models";
import { fileURLToPath } from 'url';
import { dirname } from 'path';


import { createRequire } from "module";
const __dirname = dirname(fileURLToPath(import.meta.url));

@action({ UUID: "com.jakub-stihavka.easy-macro-recordplay.play" })
export class MacroPlay extends SingletonAction<MacroSettings> {
  private isPlaying = false;
  private stopPlayback = false;
  private keyboardListener: any = null; // store the listener

  override async onWillAppear(ev: WillAppearEvent<MacroSettings>): Promise<void> {
    this.isPlaying = false;
    this.stopPlayback = false;
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    const settings = await streamDeck.settings.getGlobalSettings<MacroSettings>() || {};
    const require = createRequire(import.meta.url);
    if (!this.isPlaying) {
      // Start playback
      this.isPlaying = true;
      this.stopPlayback = false;
      ev.action.setTitle("Stop");

      if (!settings.macros || settings.macros.length === 0) {
        ev.action.setTitle("No Macro");
        streamDeck.logger.info("No macro found");
        this.isPlaying = false;
        return;
      }

      const delayBetweenReplays = ev.payload.settings.delayBetweenReplays as number ?? 1000; // Default to 1000ms if not set
      this.startMacroLoop(settings.macros[0].events, ev, delayBetweenReplays);
    } else {
      // Stop playback
      this.stopPlayback = true;
      this.isPlaying = false;
      ev.action.setTitle("Replay");
      streamDeck.logger.info("Playback stopped by user.");
    }
  }

  private async startMacroLoop(events: MacroEvent[], ev: KeyDownEvent<MacroSettings>, delayBetweenReplays: number): Promise<void> {
    if (events.length === 0) {
      streamDeck.logger.info("No events to play");
      ev.action.setTitle("No events");
      this.isPlaying = false;
      return;
    }
    streamDeck.logger.info("Should be called onceaabbcc")

    const startTime = Date.now();
    
    const require = createRequire(import.meta.url);
    const { keyboard, Key } = require("@nut-tree-fork/nut-js") as {
      keyboard: any;
      Key: { [key: string]: number };
    };
    
    // Create a mapping from JavaScript numeric key codes to nut-js keys
    const jsKeyCodeToNutKey: { [key: number]: number } = {
      27: Key.Escape,
      112: Key.F1,  // F1 key code in many browsers is 112
      113: Key.F2,
      114: Key.F3,
      115: Key.F4,
      116: Key.F5,
      117: Key.F6,
      118: Key.F7,
      119: Key.F8,
      120: Key.F9,
      121: Key.F10,
      122: Key.F11,
      123: Key.F12,
      // ... add others as needed
      192: Key.Grave, // `
      49: Key.Num1,
      50: Key.Num2,
      51: Key.Num3,
      52: Key.Num4,
      53: Key.Num5,
      54: Key.Num6,
      55: Key.Num7,
      56: Key.Num8,
      57: Key.Num9,
      48: Key.Num0,
      189: Key.Minus,
      187: Key.Equal,
      8: Key.Backspace,
      // Navigation keys might vary between browsers:
      45: Key.Insert,
      36: Key.Home,
      33: Key.PageUp,
      144: Key.NumLock,
      // For numpad keys you might need to check if your app distinguishes them.
      9: Key.Tab,
      81: Key.Q,
      87: Key.W,
      69: Key.E,
      82: Key.R,
      84: Key.T,
      89: Key.Y,
      85: Key.U,
      73: Key.I,
      79: Key.O,
      80: Key.P,
      219: Key.LeftBracket,
      221: Key.RightBracket,
      220: Key.Backslash,
      46: Key.Delete,
      35: Key.End,
      34: Key.PageDown,
      65: Key.A,
      83: Key.S,
      68: Key.D,
      70: Key.F,
      71: Key.G,
      72: Key.H,
      74: Key.J,
      75: Key.K,
      76: Key.L,
      186: Key.Semicolon,
      222: Key.Quote,
      13: Key.Return,
      90: Key.Z,
      88: Key.X,
      67: Key.C,
      86: Key.V,
      66: Key.B,
      78: Key.N,
      77: Key.M,
      188: Key.Comma,
      190: Key.Period,
      191: Key.Slash,
      16: Key.LeftShift,  // Note: sometimes 16 is used for both left and right shift
      17: Key.LeftControl, // Similarly for control keys
      18: Key.LeftAlt,
      32: Key.Space,
      // Arrow keys
      37: Key.Left,
      38: Key.Up,
      39: Key.Right,
      40: Key.Down
    };
    
    // A function to map a JavaScript key code (number) to a nut-js key code (number)
    function mapJsKeyCode(jsKeyCode: number): number | undefined {
      return jsKeyCodeToNutKey[jsKeyCode];
    }

    while (!this.stopPlayback) {
      if (Date.now() - startTime > 10000) {
        // Stop after 10 seconds for safety
        streamDeck.logger.info("Playback auto-stopped after 10 seconds");
        this.stopPlayback = true;
        break;
      }

      for (let i = 0; i < events.length; i++) {
        if (this.stopPlayback) break;
        const event = events[i];
        const delay = events[i + 1]?.duration - event.duration;
        await this.delay(delay);
        if (this.stopPlayback) break;

        // Simulate key event
        streamDeck.logger.info(`Simulating ${event.eventType == EventType.UP ? "UP" : "DOWN"} for key ${event.key}`);
        const nutKey = mapJsKeyCode(event.key);
        if (event.eventType == EventType.UP) {
          streamDeck.logger.info(`Releasing key ${nutKey}`);
          await keyboard.releaseKey(nutKey);
        }
        else {
          await keyboard.pressKey(nutKey);
          
          streamDeck.logger.info(`Pressing key ${nutKey}`);
        }
      }

      // Apply the user-defined delay before replaying the macro
      if (!this.stopPlayback) {
        streamDeck.logger.info(`Waiting ${delayBetweenReplays}ms before replaying the macro...`);
        await this.delay(delayBetweenReplays);
      }
    }

    // Cleanup after stopping
    ev.action.setTitle("Replay");
    streamDeck.logger.info("Playback finished or stopped.");
    this.isPlaying = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
