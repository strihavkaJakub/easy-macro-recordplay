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
  private delayBetweenReplays = 1000;
  private previousState: { [key: string]: boolean } = {};

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    this.isPlaying = false;
    this.stopPlayback = false;
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {    
    const settings = await streamDeck.settings.getGlobalSettings<MacroSettings>() || {};
    this.delayBetweenReplays = settings.delayBetweenReplays || 1000;
    const require = createRequire(import.meta.url);
    const state = ev.payload.state;
    if (!this.isPlaying && state == 0) {
      await this.startPlayback(ev, settings);
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
    await this.startMacroLoop(settings.macros[0].events, ev, this.delayBetweenReplays);
  }

  private async startMacroLoop(events: MacroEvent[], ev: KeyDownEvent, delayBetweenReplays: number): Promise<void> {
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
        streamDeck.logger.info(`Processing event with ${currentEvent.duration}ms duration`);
        await this.delay(currentEvent.duration);
        await this.processEvent(currentEvent, this.previousState, keyboard);
        this.previousState = { ...currentEvent.keyState };
      }
      if (!this.stopPlayback) {
        streamDeck.logger.info(`Waiting ${delayBetweenReplays}ms before replaying the macro...`);
        await this.delay(delayBetweenReplays);
      }
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