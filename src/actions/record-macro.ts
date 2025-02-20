import streamDeck, { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { createRequire } from "module";
import { EventType, Macro, MacroEvent, MacroSettings } from "../model/models";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Define the custom event type
interface CustomInputEvent {
  keycode: number;
  nameRaw?: string;
  name?: string;
  standardName?: string;
  state: EventType
}
@action({ UUID: "com.jakub-stihavka.easy-macro-recordplay.record" })
export class MacroRecord extends SingletonAction<MacroSettings> {
  private settings = {} as MacroSettings;
  private keyboardListener: any = null; // store the listener

  constructor() {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent<MacroSettings>): Promise<void> {
    this.settings = await streamDeck.settings.getGlobalSettings<MacroSettings>() || {};
    
    if (!this.settings.macros) this.settings.macros = [];
    if (!this.settings.currentRecording) this.settings.currentRecording = [];
    this.settings.isRecording = false;

    await streamDeck.settings.setGlobalSettings(this.settings);
    
    ev.action.setTitle("Record");
  }

  override async onKeyDown(ev: KeyDownEvent<MacroSettings>): Promise<void> {
    this.settings = await streamDeck.settings.getGlobalSettings<MacroSettings>() || {};

    const require = createRequire(import.meta.url);
    const { GlobalKeyboardListener } = require("node-global-key-listener");

    if (!this.settings.isRecording) {
      // Start recording
      this.settings.isRecording = true;
      this.settings.currentRecording = [];
      await streamDeck.settings.setGlobalSettings(this.settings);
      
      await ev.action.setTitle("Recording...");
      streamDeck.logger.info("Started recording");

      // Create and store the listener instance
      this.keyboardListener = new GlobalKeyboardListener();
      var previousTimeStamp: number
      this.keyboardListener.addListener((e: any, down: any) => {
        streamDeck.logger.info(`Down: ${JSON.stringify(down)}`);
        streamDeck.logger.info(`Key event: ${JSON.stringify(e)}`);
        // Construct the custom event
        const event: CustomInputEvent = {
          keycode: e.vKey,
          nameRaw: e.nameRaw,
          name: e.name,
          standardName: e.standardName,
          state: down ? EventType.DOWN : EventType.UP,
        };
        const clickTimeStamp = Date.now();
        const duration = previousTimeStamp ? clickTimeStamp - previousTimeStamp : 0;
        previousTimeStamp = clickTimeStamp;
        this.recordKeyEvent(event, duration);
      });
    } else {
      // Stop recording
      this.settings.isRecording = false;
      if (this.keyboardListener) {
        this.keyboardListener.kill();
        this.keyboardListener = null;
      }

      if (!this.settings.currentRecording || this.settings.currentRecording.length === 0) {
        streamDeck.logger.warn("No key events recorded.");
        await ev.action.setTitle("No Events");
        return;
      }

      // Save new macro
      const newMacro: Macro = {
        id: `macro_${Date.now()}`,
        events: this.settings.currentRecording,
      };
      this.settings.macros = [newMacro];

      // Clear temporary recording buffer
      this.settings.currentRecording = [];

      // Save settings globally
      await streamDeck.settings.setGlobalSettings(this.settings);
      streamDeck.logger.info("Finished recording and saved macro", newMacro);

      await ev.action.setTitle("Saved Macro");
    }
  }

  private async recordKeyEvent(event: CustomInputEvent, duration: number) {
    if (!this.settings.isRecording) return;
    
    // Create a MacroEvent
    const macroEvent: MacroEvent = {
      key: event.keycode,
      eventType: event.state,
      duration: duration
    };

    // Store event in the recording buffer
    this.settings.currentRecording?.push(macroEvent);
    streamDeck.logger.info(`Recorded event: ${JSON.stringify(macroEvent)}`);
    
    await streamDeck.settings.setGlobalSettings(this.settings);
  }
}