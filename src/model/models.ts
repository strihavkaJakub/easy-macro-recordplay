export type MacroEvent = {
  key: number;
  eventType: EventType,
  duration: number; // Epoch timestamp for when the event occurred
};

export type Macro = {
  id: string; // Unique identifier (could be a timestamp or GUID)
  events: MacroEvent[];
};

export type MacroSettings = {
  macros?: Macro[];
  currentRecording?: MacroEvent[];
  isRecording?: boolean;
};

export enum EventType {
  UP,
  DOWN
}
