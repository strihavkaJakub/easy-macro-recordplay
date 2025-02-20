export type MacroEvent = {
  keyState: { [key: string]: boolean }; // Current key state
  duration: number; // Time since the last snapshot
};

export type Macro = {
  id: string;
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
