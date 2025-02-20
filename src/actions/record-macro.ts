import streamDeck, { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { createRequire } from "module";
import { Macro, MacroEvent, MacroSettings } from "../model/models";

const __dirname = dirname(fileURLToPath(import.meta.url));
const emptySettings: MacroSettings = { currentRecording: [], isRecording: false, macros: []};

@action({ UUID: "com.jakub-stihavka.easy-macro-recordplay.record" })
export class MacroRecord extends SingletonAction<MacroSettings> {
  private settings: MacroSettings = { currentRecording: [], isRecording: false, macros: []};
  private keyboardListener: any = null;
  private lastTimestamp: number = 0;
  constructor() {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent<MacroSettings>): Promise<void> {
    this.settings = await streamDeck.settings.getGlobalSettings<MacroSettings>() || {};
    this.settings.currentRecording = [];
    if (!this.settings.macros) this.settings.macros = [];
    if (!this.settings.currentRecording) this.settings.currentRecording = [];
    this.settings.isRecording = false;    
    ev.action.setTitle("Record");
  }

  override async onKeyDown(ev: KeyDownEvent<MacroSettings>): Promise<void> {
    this.settings = await streamDeck.settings.getGlobalSettings<MacroSettings>() || {};
    const require = createRequire(import.meta.url);
    const { GlobalKeyboardListener } = require("node-global-key-listener");

    if (!this.settings.isRecording) {
      await streamDeck.settings.setGlobalSettings(emptySettings);
      this.settings.isRecording = true;
      this.settings.currentRecording = [];
      this.settings.macros = [];
      this.lastTimestamp = Date.now();

      
      await ev.action.setTitle("Recording...");
      streamDeck.logger.info("Started recording");

      // Nastav listener a ulož jeho referenci
      this.keyboardListener = new GlobalKeyboardListener();
      this.keyboardListener.addListener((e: any, down: any) => {
        const currentTimestamp = Date.now();
        const duration = currentTimestamp - this.lastTimestamp;
        this.lastTimestamp = currentTimestamp;

        const event: MacroEvent = {
          keyState: { ...down },
          duration
        };

        // Uložíme událost do lokálního pole
        if (this.settings && this.settings.currentRecording) {
          this.settings.currentRecording.push(event);
          streamDeck.logger.info(`Recorded event: ${JSON.stringify(event)}`);

          // Možná zde uložíš nastavení po každé události, ale dávej pozor na výkon!
          streamDeck.settings.setGlobalSettings(this.settings);
        }
      });
    } else {
      // Zastav nahrávání, ukonči listener, a ulož makro
      this.settings.isRecording = false;
      
      if (this.keyboardListener) {
        // Tato metoda ukončí listener
        this.keyboardListener.kill();
        this.keyboardListener = null;
        streamDeck.logger.info("Stopped recording and killed listener");
      }

      // Aktualizujeme globální nastavení
      await streamDeck.settings.setGlobalSettings(this.settings);
      
      if (!this.settings.currentRecording || this.settings.currentRecording.length === 0) {
        streamDeck.logger.warn("No key events recorded.");
        await ev.action.setTitle("No Events");
        return;
      }

      const newMacro: Macro = {
        id: `macro_${Date.now()}`,
        events: this.settings.currentRecording
      };

      // Uložíme makro
      if (this.settings.macros) {
        this.settings.macros.push(newMacro);
      }
      // Vyprázdníme aktuální nahrávání
      this.settings.currentRecording = [];

      await streamDeck.settings.setGlobalSettings(this.settings);

      streamDeck.logger.info("Finished recording and saved macro", newMacro);
      await ev.action.setTitle("Saved Macro");
    }
  }
}
