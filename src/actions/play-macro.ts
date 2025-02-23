import streamDeck, { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { MacroEvent, MacroSettings } from "../model/models";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { createRequire } from "module";
import { keyToNutKey } from "../utils/utils";  // converts key string to JS key code

const __dirname = dirname(fileURLToPath(import.meta.url));

@action({ UUID: "com.jakub-stihavka.easy-macro-recordplay.play" })
export class MacroPlay extends SingletonAction {
  private isPlaying = false;
  private stopPlayback = false;
  private delayBetweenReplays: number = 1000;
  private delayOffset: number = 0;
  private previousState: { [key: string]: boolean } = {};
  private ignoreStartDelay = false;
  private settings: MacroSettings = {};

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    this.isPlaying = false;
    this.stopPlayback = false;
    if (ev.payload.state == 0)
      this.releaseAllKeys()
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {    
    this.settings = await streamDeck.settings.getGlobalSettings<MacroSettings>() || {};
    this.delayBetweenReplays = this.settings.delayBetweenReplays as number || 1000;
    this.delayOffset = this.settings.delayOffset ? parseInt(this.settings.delayOffset) : 0;
    const require = createRequire(import.meta.url);
    const state = ev.payload.state;
    streamDeck.logger.info("Settings wtf", JSON.stringify(this.settings))
    this.ignoreStartDelay = this.settings.ignoreStartDelay ?? false
    if (!this.isPlaying && state == 0) {
      await this.startPlayback(ev, this.settings);
    } else {
      this.stopPlayback = true;
      this.isPlaying = false;
      await this.releaseAllKeys();
      streamDeck.logger.info("Playback stopped by user.");
    }
  }

  private async startPlayback(ev: KeyDownEvent, settings: MacroSettings): Promise<void> {
    this.isPlaying = true;
    this.stopPlayback = false;

    if (!settings.macros || settings.macros.length === 0) {
      streamDeck.logger.info("No macro found");
      this.isPlaying = false;
      return;
    }
    streamDeck.logger.info(`Playing macro ${JSON.stringify(ev.payload.settings)}`);
    await this.startMacroLoop(settings.macros[0].events, ev);
  }

  private async startMacroLoop(events: MacroEvent[], ev: KeyDownEvent): Promise<void> {
    if (events.length === 0) {
      streamDeck.logger.info("No events to play");
      this.isPlaying = false;
      return;
    }
    streamDeck.logger.info(`Playing macro with ${events.length} events`);

    const require = createRequire(import.meta.url);
    const { keyboard, Key } = require("@nut-tree-fork/nut-js") as {
      keyboard: any;
      Key: { [key: string]: number };
    };
    keyboard.config.autoDelayMs = 0;
    this.previousState = {};

    while (!this.stopPlayback) {
      for (const currentEvent of events) {
        if (this.stopPlayback) break;
        streamDeck.logger.info(`Processing event with ${currentEvent.duration + this.delayOffset}ms duration`);
        if(!this.ignoreStartDelay)
          await this.delay(currentEvent.duration + this.delayOffset);
        this.ignoreStartDelay = false
        await this.processEvent(currentEvent, this.previousState, keyboard);
        this.previousState = { ...currentEvent.keyState };
      }
      if (!this.stopPlayback) {
        streamDeck.logger.info(`Waiting ${this.delayBetweenReplays}ms before replaying the macro...`);
        await this.delay(this.delayBetweenReplays);
      }
      this.ignoreStartDelay = this.settings.ignoreStartDelay ?? false
    }

    await this.releaseAllKeys()
    streamDeck.logger.info("Playback finished or stopped.");
    this.isPlaying = false;
  }

  private async processEvent(currentEvent: MacroEvent, previousState: { [key: string]: boolean }, keyboard: any): Promise<void> {
    for (const key in currentEvent.keyState) {
      const isPressedNow = currentEvent.keyState[key];
      const wasPressedBefore = previousState[key] || false;

      if (isPressedNow && !wasPressedBefore) {
        const nutKey = keyToNutKey(key);
        if (nutKey !== undefined) {
          streamDeck.logger.info(`Pressing key ${nutKey} for ${key}`);
          await keyboard.pressKey(nutKey);
        } else {
          streamDeck.logger.warn(`No nut-js mapping for key: ${key}`);
        }
      }

      if (!isPressedNow && wasPressedBefore) {
        const nutKey = keyToNutKey(key);
        if (nutKey !== undefined) {
          streamDeck.logger.info(`Releasing key ${nutKey} for ${key}`);
          await keyboard.releaseKey(nutKey);
        } else {
          streamDeck.logger.warn(`No nut-js mapping for key: ${key}`);
        }
      }
    }
  }

  private async releaseAllKeys(): Promise<void> {
    const require = createRequire(import.meta.url);
    const { keyboard } = require("@nut-tree-fork/nut-js") as {
      keyboard: any;
    };

    for (const key in this.previousState) {
      if (this.previousState[key]) {
        const nutKey = keyToNutKey(key);
        if (nutKey !== undefined) {
          streamDeck.logger.info(`Releasing key ${nutKey} for ${key}`);
          await keyboard.releaseKey(nutKey);
        } else {
          streamDeck.logger.warn(`No nut-js mapping for key: ${key}`);
        }
      }
    }
    this.previousState = {};
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}