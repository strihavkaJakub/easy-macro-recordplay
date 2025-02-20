import streamDeck from "@elgato/streamdeck";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { Key } = require("@nut-tree-fork/nut-js") as {
  Key: { [key: string]: any };
};

/**
 * Direct mapping of key names to `nut-js` Key enums.
 */
const keyMappings: { [key: string]: any } = {
  "ESCAPE": Key.Escape,
  "F1": Key.F1, "F2": Key.F2, "F3": Key.F3, "F4": Key.F4,
  "F5": Key.F5, "F6": Key.F6, "F7": Key.F7, "F8": Key.F8,
  "F9": Key.F9, "F10": Key.F10, "F11": Key.F11, "F12": Key.F12,
  
  "GRAVE": Key.Grave,
  "NUMPAD 1": Key.NumPad1, "NUMPAD 2": Key.NumPad2, "NUMPAD 3": Key.NumPad3,
  "NUMPAD 4": Key.NumPad4, "NUMPAD 5": Key.NumPad5, "NUMPAD 6": Key.NumPad6,
  "NUMPAD 7": Key.NumPad7, "NUMPAD 8": Key.NumPad8, "NUMPAD 9": Key.NumPad9,
  "NUMPAD 0": Key.NumPad0,

  "1": Key.Num1, "2": Key.Num2, "3": Key.Num3,
  "4": Key.Num4, "5": Key.Num5, "6": Key.Num6,
  "7": Key.Num7, "8": Key.Num8, "9": Key.Num9,
  "0": Key.Num0,

  "MINUS": Key.Minus, "EQUAL": Key.Equal, "BACKSPACE": Key.Backspace,
  "INSERT": Key.Insert, "HOME": Key.Home, "PAGE UP": Key.PageUp,
  "NUM LOCK": Key.NumLock, "TAB": Key.Tab,

  "Q": Key.Q, "W": Key.W, "E": Key.E, "R": Key.R, "T": Key.T,
  "Y": Key.Y, "U": Key.U, "I": Key.I, "O": Key.O, "P": Key.P,
  "LEFT BRACKET": Key.LeftBracket, "RIGHT BRACKET": Key.RightBracket,
  "BACKSLASH": Key.Backslash, "DELETE": Key.Delete, "END": Key.End,
  "PAGE DOWN": Key.PageDown,

  "A": Key.A, "S": Key.S, "D": Key.D, "F": Key.F, "G": Key.G,
  "H": Key.H, "J": Key.J, "K": Key.K, "L": Key.L,
  "SEMICOLON": Key.Semicolon, "QUOTE": Key.Quote, "ENTER": Key.Return,

  "Z": Key.Z, "X": Key.X, "C": Key.C, "V": Key.V, "B": Key.B,
  "N": Key.N, "M": Key.M, "COMMA": Key.Comma, "PERIOD": Key.Period,
  "SLASH": Key.Slash, "DOT": Key.Dot,

  "LEFT SHIFT": Key.LeftShift, "RIGHT SHIFT": Key.RightShift,
  "LEFT CONTROL": Key.LeftControl, "RIGHT CONTROL": Key.RightControl,
  "LEFT ALT": Key.LeftAlt, "RIGHT ALT": Key.RightAlt,
  "LEFT SUPER": Key.LeftSuper, "RIGHT SUPER": Key.RightSuper,
  
  "UP": Key.Up, "DOWN": Key.Down, "LEFT": Key.Left, "RIGHT": Key.Right,
  "SPACE": Key.Space, "MENU": Key.Menu, "CAPS LOCK": Key.CapsLock,
};

/**
 * Convert a key name (e.g., "A", "LEFT SHIFT") to its `nut-js` equivalent.
 */
export function keyToNutKey(key: string): any | undefined {
  const upperKey = key.toUpperCase();
  if (keyMappings[upperKey]) {
    return keyMappings[upperKey];
  } else {
    streamDeck.logger.warn(`No mapping found for key: ${key}`);
    return undefined;
  }
}
