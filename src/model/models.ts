export type MacroEvent = {
  keyState: { [key: string]: boolean }; // Current key state
  duration: number; // Time since the last snapshot
};

export type Macro = {
  id: string;
  events: MacroEvent[];
};

export type MacroSettings = {
  ignoreStartDelay?: boolean;
  macros?: Macro[];
  currentRecording?: MacroEvent[];
  delayBetweenReplays?: number;
  delayOffset?: string;
  isRecording?: boolean;
};

export enum EventType {
  UP,
  DOWN
}
