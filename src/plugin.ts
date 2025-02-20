import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { MacroRecord } from "./actions/record-macro";
import { MacroPlay } from "./actions/play-macro";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel(LogLevel.TRACE);

// Register the increment action.
streamDeck.actions.registerAction(new MacroRecord());
streamDeck.actions.registerAction(new MacroPlay());

// Finally, connect to the Stream Deck.
streamDeck.connect();
