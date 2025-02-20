import streamDeck, { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { createRequire } from "module";
import { Macro, MacroEvent, MacroSettings } from "../model/models";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const emptySettings: MacroSettings = { currentRecording: [], isRecording: false, macros: [] };

@action({ UUID: "com.jakub-stihavka.easy-macro-recordplay.record" })
export class MacroRecord extends SingletonAction<MacroSettings> {
  private settings: MacroSettings = { currentRecording: [], isRecording: false, macros: [] };
  private keyboardListener: any = null;
  private lastTimestamp: number = 0;

  constructor() {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent<MacroSettings>): Promise<void> {
    this.settings = await streamDeck.settings.getGlobalSettings<MacroSettings>() || {};
    this.settings.currentRecording = [];
    this.settings.macros = this.settings.macros || [];
    this.settings.isRecording = false;
    await streamDeck.settings.setGlobalSettings(this.settings);
    ev.action.setTitle("Record");
  }

  override async onKeyDown(ev: KeyDownEvent<MacroSettings>): Promise<void> {
    this.settings = await streamDeck.settings.getGlobalSettings<MacroSettings>() || {};
    const require = createRequire(import.meta.url);
    const { GlobalKeyboardListener } = require("node-global-key-listener");

    if (!this.settings.isRecording) {
      await this.startRecording(ev, GlobalKeyboardListener);
    } else {
      await this.stopRecording(ev);
    }
  }

  private async startRecording(ev: KeyDownEvent<MacroSettings>, GlobalKeyboardListener: any): Promise<void> {
    this.settings.isRecording = true;
    this.settings.currentRecording = [];
    this.settings.macros = [];
    this.lastTimestamp = Date.now();
    await streamDeck.settings.setGlobalSettings(this.settings);
    await ev.action.setTitle("Recording...");
    streamDeck.logger.info("Started recording");

    this.keyboardListener = new GlobalKeyboardListener();
    this.keyboardListener.addListener((e: any, down: any) => this.recordEvent(down));
  }

  private async stopRecording(ev: KeyDownEvent<MacroSettings>): Promise<void> {
    this.settings.isRecording = false;
    if (this.keyboardListener) {
      this.keyboardListener.kill();
      this.keyboardListener = null;
      streamDeck.logger.info("Stopped recording and killed listener");
    }

    await streamDeck.settings.setGlobalSettings(this.settings);
    if (!this.settings.currentRecording || this.settings.currentRecording.length === 0) {
      streamDeck.logger.warn("No key events recorded.");
      await ev.action.setTitle("No Events");
      return;
    }

    const newMacro: Macro = {
      id: `macro_${Date.now()}`,
      events: this.settings.currentRecording,
    };
    if (this.settings.macros) {
      this.settings.macros.push(newMacro);
    }
    this.settings.currentRecording = [];
    await streamDeck.settings.setGlobalSettings(this.settings);
    streamDeck.logger.info("Finished recording and saved macro", newMacro);
    await ev.action.setTitle("Saved Macro");
  }

  private recordEvent(down: any): void {
    const currentTimestamp = Date.now();
    const duration = currentTimestamp - this.lastTimestamp;
    this.lastTimestamp = currentTimestamp;

    const event: MacroEvent = {
      keyState: { ...down },
      duration,
    };

    if (this.settings && this.settings.currentRecording) {
      this.settings.currentRecording.push(event);
      streamDeck.logger.info(`Recorded event: ${JSON.stringify(event)}`);
      streamDeck.settings.setGlobalSettings(this.settings);
    }
  }
}