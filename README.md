<h1>Easy Macro Record/Play</h1>
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

<h2>Security - PLEASE READ</h2>
<p>The plugin does not use any internet connection or anything that could send your private data.</p>
<p>It only collects what you type/press while the recording is running and then it is stored in the plugin global settings. Then a Play action replays what has been recorded. 
The memory is deleted and overwritten on a new recording.</p>
<p><b>The plugin does not care what you write, does not analyze it in any way and does not send any data elsewhere</b></p>

<p><b>But please do not record any sensitive information. The global settings are not that secure - based on the Elgato docs, they are not meant to store sensitive info</b></p>

<h2>Installation for Users</h2>
<ol>
  <li>Download the plugin from the Elgato Marketplace</li>
  <li>Double-click the downloaded file to install it to your Stream Deck</li>
  <li>The plugin should now appear in your Stream Deck actions list under "Easy Macro Record/Play"</li>
  <li>Drag the "Record Macro" and "Play Macro" actions to your Stream Deck</li>
</ol>

<h3>System Requirements</h3>
<ul>
  <li>Stream Deck device</li>
  <li>Stream Deck software version 6.4 or higher</li>
  <li>Windows 10 or newer / macOS 12 or newer</li>
</ul>

<h2>How to Use</h2>

<h3>Recording a Macro</h3>
<ol>
  <li>Press the "Record Macro" button on your Stream Deck</li>
  <li>The button will change to indicate recording is in progress</li>
  <li>Perform the keyboard and/or mouse actions you want to record</li>
  <li>Press the "Record Macro" button again to stop recording and save the macro</li>
</ol>

<h3>Playing a Macro</h3>
<ol>
  <li>Press the "Play Macro" button on your Stream Deck</li>
  <li>The button will change to indicate playback is in progress</li>
  <li>The recorded macro will be executed</li>
  <li>Press the "Play Macro" button again to stop playback</li>
</ol>

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

<h2>Troubleshooting</h2>

<h3>Common Issues</h3>
<ul>
  <li><strong>Macro doesn't record:</strong> Make sure no other applications are capturing keyboard input globally</li>
  <li><strong>Playback doesn't work in some applications:</strong> Some applications may block simulated keyboard input for security reasons</li>
  <li><strong>Macro playback is too fast/slow:</strong> Adjust the "Delay offset" setting in the Play Macro action</li>
</ul>

<h3>Platform-Specific Notes</h3>
<ul>
  <li><strong>Windows:</strong> Fully tested on Windows 10/11</li>
  <li><strong>Mac:</strong> Currently not working. Every new recording needs a system password for key logger and playback does not work./li>
</ul>

<h2>For Developers</h2>

<h3>How to run</h3>
A project based on the Stream Deck SDK: <a href="https://docs.elgato.com/streamdeck/sdk/introduction/getting-started/">https://docs.elgato.com/streamdeck/sdk/introduction/getting-started/</a>
<h3>Requirements:</h3>
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

<h3>Running tests</h3>
<code>npm test</code>

<h2>Version History</h2>
<ul>
  <li><strong>1.0.0.0</strong> - Initial public release with Windows support</li>
</ul>
