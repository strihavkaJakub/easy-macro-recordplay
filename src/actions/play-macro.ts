import streamDeck, { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { MacroEvent, MacroSettings } from "../model/models";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { createRequire } from "module";
import { keyToNutKey } from "../utils/utils";  // converts key string to JS key code

const __dirname = dirname(fileURLToPath(import.meta.url));

@action({ UUID: "com.jakub-stihavka.easy-macro-recordplay.play" })
export class MacroPlay extends SingletonAction<MacroSettings> {
  private isPlaying = false;
  private stopPlayback = false;

  override async onWillAppear(ev: WillAppearEvent<MacroSettings>): Promise<void> {
    this.isPlaying = false;
    this.stopPlayback = false;
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    const settings = await streamDeck.settings.getGlobalSettings<MacroSettings>() || {};
    const require = createRequire(import.meta.url);

    if (!this.isPlaying) {
      await this.startPlayback(ev, settings);
    } else {
      this.stopPlayback = true;
      this.isPlaying = false;
      ev.action.setTitle("Replay");
      streamDeck.logger.info("Playback stopped by user.");
    }
  }

  private async startPlayback(ev: KeyDownEvent, settings: MacroSettings): Promise<void> {
    this.isPlaying = true;
    this.stopPlayback = false;
    ev.action.setTitle("Stop");

    if (!settings.macros || settings.macros.length === 0) {
      ev.action.setTitle("No Macro");
      streamDeck.logger.info("No macro found");
      this.isPlaying = false;
      return;
    }

    const delayBetweenReplays = ev.payload.settings.delayBetweenReplays as number ?? 1000;
    await this.startMacroLoop(settings.macros[0].events, ev, delayBetweenReplays);
  }

  private async startMacroLoop(events: MacroEvent[], ev: KeyDownEvent<MacroSettings>, delayBetweenReplays: number): Promise<void> {
    if (events.length === 0) {
      streamDeck.logger.info("No events to play");
      ev.action.setTitle("No events");
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
    let previousState: { [key: string]: boolean } = {};

    while (!this.stopPlayback) {
      for (const currentEvent of events) {
        if (this.stopPlayback) break;
        await this.processEvent(currentEvent, previousState, keyboard);
        previousState = { ...currentEvent.keyState };
        await this.delay(currentEvent.duration);
      }
      if (!this.stopPlayback) {
        streamDeck.logger.info(`Waiting ${delayBetweenReplays}ms before replaying the macro...`);
        await this.delay(delayBetweenReplays);
      }
    }

    ev.action.setTitle("Replay");
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

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}