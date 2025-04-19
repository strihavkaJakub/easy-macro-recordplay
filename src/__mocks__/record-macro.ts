// Mock version of the record-macro.ts file for testing

import streamDeck from '@elgato/streamdeck';

// Simplified implementation for testing
export class MacroRecord {
    private keyboardListener: any = null;
    private settings: any = { 
        isRecording: false, 
        currentRecording: [],
        macros: [] 
    };
    private lastTimestamp: number = 0;

    async onWillAppear(event: any): Promise<void> {
        this.settings = {
            currentRecording: [],
            macros: [],
            isRecording: false,
        };
        await streamDeck.settings.setGlobalSettings(this.settings);
    }

    async onKeyDown(event: any): Promise<void> {
        if (event.payload.state !== 0) return;

        if (!this.settings.isRecording) {
            await this.startRecording(event);
        } else {
            await this.stopRecording(event);
        }
    }

    private async startRecording(event: any, GlobalKeyboardListenerConstructor?: any): Promise<void> {
        this.settings.isRecording = true;
        this.settings.currentRecording = [];
        this.lastTimestamp = Date.now();
        await streamDeck.settings.setGlobalSettings(this.settings);
        streamDeck.logger.info('Started recording');

        // If we have a constructor for testing purposes
        if (GlobalKeyboardListenerConstructor) {
            this.keyboardListener = new GlobalKeyboardListenerConstructor();
        } else {
            // In test environment, we won't have the actual listener
            this.keyboardListener = {
                addListener: jest.fn(),
                kill: jest.fn()
            };
        }

        // Add mock listeners
        if (this.keyboardListener) {
            this.keyboardListener.addListener('down', (e: any) => {
                this.recordEvent({ [e.name]: true });
            });
            this.keyboardListener.addListener('up', (e: any) => {
                this.recordEvent({ [e.name]: false });
            });
        }
    }

    private async stopRecording(event: any): Promise<void> {
        if (this.keyboardListener) {
            this.keyboardListener.kill();
            this.keyboardListener = null;
        }

        if (this.settings.currentRecording.length > 0) {
            const macroId = `macro_${Date.now()}`;
            this.settings.macros.push({
                id: macroId,
                events: this.settings.currentRecording,
            });
        }

        this.settings.isRecording = false;
        this.settings.currentRecording = [];
        await streamDeck.settings.setGlobalSettings(this.settings);
        streamDeck.logger.info('Stopped recording');
    }

    private recordEvent(keyState: { [key: string]: boolean }): void {
        const currentTime = Date.now();
        const duration = currentTime - this.lastTimestamp;
        this.lastTimestamp = currentTime;

        this.settings.currentRecording.push({
            keyState,
            duration,
        });

        streamDeck.logger.info(`Recorded key event: ${JSON.stringify(keyState)}`);
        streamDeck.settings.setGlobalSettings(this.settings);
    }
}