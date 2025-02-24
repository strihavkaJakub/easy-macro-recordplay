<h1>Easy macro Record/Play</h1>
<h2>About the plugin</h2>
<p>A very easy plugin to record and play a macro from a StreamDeck.</p>
<p>Each keystroke or mouse click is recorded with a corresponding delay as it is entered.</p>
<p>Macros can be recorded from inside any application or game.</p>
<p>A macro will record or play until the action key is pressed again.</p>
<p>Holding down a key is also supported.</p>
<p>The plugin has 2 actions.

<ul>
  <li>Record Macro</li>
  <ul><li>Record whatever is being pressed or held until the recording is stopped and saved by pressing the action again.</li></ul>
  <li>Play Macro</li>
  <ul><li>Plays back whatever was recorded until the action is pressed again.</li></ul>
</ul>
<h2>Input modifiers for Play Action:</h2>
<ul>
  <li>Delay between loops (ms)</li>
  <ul><li>Delay between a new loop after all keys have been played and a new loop begins</li></ul>
  <li>Also play mouse clicks</li>
  <ul><li>Play mouse clicks if any were recorded.</li></ul>
  <li>Instant keypresses</li>
  <ul><li>Ignore a delay between recorded keystrokes</li></ul>
  <li>Ignore a delay on replay start and repeat</li>
  <ul><li>By default, the macro playback has the same start delay as the time between pressing the Record key and the first recorded keystroke. This check box can be used to switch off the start delay. This also affects the delay between replays. Without ignoring the start delay, the next replay will start after Delay Between Replays + the initial delay between pressing the record button and the first recorded keystroke.</li></ul>
  <li>Delay offset (ms)</li>
  <ul><li>This setting allows you to add an offset to the delay between each keystroke. This can be useful if your playback keystrokes are too fast or too slow compared to the recorded speed.</li>
  <li>A positive value increases the delay between replays, a negative value decreases it.</li>
  <li>I have found that the most accurate delay offset for my PC is -4ms. But this can vary.</li></ul>
</ul>

<h2>How to run</h2>
A project based on the Stream Deck SDK: <a href="https://docs.elgato.com/streamdeck/sdk/introduction/getting-started/">https://docs.elgato.com/streamdeck/sdk/introduction/getting-started/</a>
Requirements:
<ul>
  <li>Node.js version 20 or higher.</li>
  <li>Stream Deck device.</li>
  <li>Stream Deck version 6.4 or higher.</li>
  <li>Installed Stream Deck CLI</li>
</ul>

<h3>To install the plugin on your Stream Deck device</h3>
<code>streamdeck link com.jakub-stihavka.easy-macro-recordplay.sdPlugin</code>

<h3>To run the code, install the plugin and reflect all code on save</h3>
<code>npm run watch</code>

<H2>Currently tested only on Windows.</H2>
Theoretically basic keys should work on other platforms but some OS specific keys (like Option key) might not work
