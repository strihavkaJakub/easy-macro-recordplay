import streamDeck, { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { MacroEvent, MacroSettings } from "../model/models";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { createRequire } from "module";
import { keyToNutKey, keyToNutMouse } from "../utils/utils";  // converts key string to JS key code

const __dirname = dirname(fileURLToPath(import.meta.url));

@action({ UUID: "com.jakub-strihavka.easy-macro-recordplay.play" })
export class MacroPlay extends SingletonAction {
  private isPlaying = false;
  private stopPlayback = false;
  private delayBetweenReplays: number = 1000;
  private delayOffset: number = 0;
  private previousState: { [key: string]: boolean } = {};
  private ignoreStartDelay = false;
  private settings: MacroSettings = {};
  private instant: boolean = false
  private playMouse: boolean = true

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    this.isPlaying = false;
    this.stopPlayback = false;
    this.releaseAllKeys()
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {    
    this.settings = await streamDeck.settings.getGlobalSettings<MacroSettings>() || {};
    this.delayBetweenReplays = this.settings.delayBetweenReplays as number || 1000;
    this.delayOffset = this.settings.delayOffset ? parseInt(this.settings.delayOffset) : 0;
    const require = createRequire(import.meta.url);
    const state = ev.payload.state;
    this.ignoreStartDelay = this.settings.ignoreStartDelay ?? false
    this.instant = this.settings.instant ?? false
    this.playMouse = this.settings.playMouse ?? true
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
    const { keyboard, Key, mouse } = require("@nut-tree-fork/nut-js") as {
      keyboard: any;
      Key: { [key: string]: number };
      mouse: any;
    };
    keyboard.config.autoDelayMs = 0;
    mouse.config.autoDelayMs = 0;
    this.previousState = {};

    while (!this.stopPlayback) {
      for (const currentEvent of events) {
        if (this.stopPlayback) break;
        if (!this.isPlaying) break;
        streamDeck.logger.info(`Processing event with ${currentEvent.duration + this.delayOffset}ms duration`);
        if(!this.ignoreStartDelay)
          await this.delay(currentEvent.duration + this.delayOffset);
        this.ignoreStartDelay = false
        await this.processEvent(currentEvent, this.previousState, keyboard, mouse);
        this.previousState = { ...currentEvent.keyState };
      }
      if (!this.stopPlayback && !this.instant) {
        streamDeck.logger.info(`Waiting ${this.delayBetweenReplays}ms before replaying the macro...`);
        await this.delay(this.delayBetweenReplays);
      }
      this.ignoreStartDelay = this.settings.ignoreStartDelay ?? false
    }

    await this.releaseAllKeys()
    streamDeck.logger.info("Playback finished or stopped.");
    this.isPlaying = false;
  }

  private async processEvent(currentEvent: MacroEvent, previousState: { [key: string]: boolean }, keyboard: any, mouse: any): Promise<void> {
    for (const key in currentEvent.keyState) {
      const isPressedNow = currentEvent.keyState[key];
      const wasPressedBefore = previousState[key] || false;

      const isMouseKey = key.includes("MOUSE")
      const nutKey = isMouseKey ? keyToNutMouse(key) : keyToNutKey(key)

      if (isPressedNow && !wasPressedBefore) {
        if (nutKey !== undefined && !isMouseKey) {
          streamDeck.logger.info(`Pressing key ${nutKey} for ${key}`);
          await keyboard.pressKey(nutKey);
        } else if (isMouseKey && this.playMouse) {
          streamDeck.logger.info("mouseKey:",nutKey)
          await mouse.pressButton(nutKey)
        }
        else {
          streamDeck.logger.warn(`No nut-js mapping for key: ${key}`);
        }
      }

      if (!isPressedNow && wasPressedBefore) {
        if (nutKey !== undefined && !isMouseKey) {
          streamDeck.logger.info(`Releasing key ${nutKey} for ${key}`);
          await keyboard.releaseKey(nutKey);
        } else if (isMouseKey && this.playMouse) {
          streamDeck.logger.info("mouseKey:",nutKey)
          await mouse.releaseButton(nutKey)
        } else {
          streamDeck.logger.warn(`No nut-js mapping for key: ${key}`);
        }
      }
    }
  }

  private async releaseAllKeys(): Promise<void> {
    const require = createRequire(import.meta.url);
    const { keyboard, mouse } = require("@nut-tree-fork/nut-js") as {
      keyboard: any;
      mouse: any;
    };

    for (const key in this.previousState) {
      if (this.previousState[key]) {
        const isMouseKey = key.includes("MOUSE")
        const nutKey = isMouseKey ? keyToNutMouse(key) : keyToNutKey(key)
        if (nutKey !== undefined && !isMouseKey) {
          streamDeck.logger.info(`Releasing key ${nutKey} for ${key}`);
          await keyboard.releaseKey(nutKey);
        } 
        else if (isMouseKey && this.playMouse) {
          streamDeck.logger.info(`Releasing mouse ${key} for ${key}`);
          await mouse.releaseButton(nutKey)
        }
        else {
          streamDeck.logger.warn(`No nut-js mapping for key: ${key}`);
        }
      }
    }
    this.previousState = {};
  }

  private delay(ms: number) {
    if(this.instant){
      streamDeck.logger.info("Skipping delay")
      return new Promise((resolve) => setTimeout(resolve, 0));
    }
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}