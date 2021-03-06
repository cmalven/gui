import dat from 'dat.gui';
import WebMidi from 'webmidi';
import Mousetrap from 'mousetrap';
import copy from 'copy-to-clipboard';

/**
 * Assists in controlling properties
 *
 * @class    Gui
 * @param    {object}  options  Options for the object
 * @return   {object}  The object
 */
const Gui = function(options) {
  //
  //   Public Vars
  //
  //////////////////////////////////////////////////////////////////////

  let self = Object.assign({}, {
    enabled: true,
    gui: new dat.GUI,
    midiPerColor: 4,
    colors: [
      '#ee907b',
      '#2ed9c3',
      '#4888f5',
      '#aa82ff',
    ],
  }, options);

  // MIDI output devices that we will attempt to automatically sync with GUI
  const supportedMidiOutputDevices = {
    'Midi Fighter Twister': {
      sync: (output, midiIdx, midiValue) => {
        output.sendControlChange(midiIdx, midiValue, 1);
        // Set RGB to max brightness
        output.sendControlChange(midiIdx, 47, 6);
      },
      clear: (output, midiIdx) => {
        output.sendControlChange(midiIdx, 0, 1);
        // Set RGB to low brightness
        output.sendControlChange(midiIdx, 20, 6);
      },
      configure: () => {
        self.connectMidiRange(0, 15);
      },
    },
    'nanoKONTROL2 CTRL': {
      configure: () => {
        self.connectMidiRange(16, 23);
        self.connectMidiRange(0, 7);
      },
    },
  };


  //
  //   Private Vars
  //
  //////////////////////////////////////////////////////////////////////

  let folders = [];
  let currentFolder = self.gui;
  let midiConnectRange = [];
  let customControls = {};
  let debugMidi = false;
  let hidden = false;
  let Midi = null;
  let midiReady = null;

  //
  //   Private Methods
  //
  //////////////////////////////////////////////////////////////////////

  const _init = function() {
    _addMidi();
    _addEventListeners();
    _addSaveMarkup();
    _addSaveEventListeners();
    _addStyles();
  };

  const _addMidi = function() {
    midiReady = new Promise((res) => {
      const webmidiEnabled = navigator.requestMIDIAccess;

      if (webmidiEnabled) {
        Midi = WebMidi;
        Midi.enable(err => {
          if (err) {
            console.error('WebMIDI is not supported in this browser.');
          } else {
            console.log('MIDI devices successfully connected.');
            _setupMidiInputs();
            res(Midi);
          }
        }, true);
      }
    })
      .catch(err => {
        console.error(err);
      });
  };

  const _addEventListeners = function() {
    document.addEventListener('keydown', ({ keyCode }) => {
      // If option/alt, enable debugging
      if (keyCode === 18) debugMidi = true;
    });

    document.addEventListener('keyup', ({ keyCode }) => {
      if (keyCode === 18) debugMidi = false;
    });

    document.addEventListener('keyup', ({ keyCode }) => {
      if (keyCode === 17) self.toggle();
    });
  };

  const _addSaveMarkup = () => {
    // Add the markup
    const markup = `
      <div class="gui-save__inner">
        <span class="gui-save__close">&times;</span>
        <p class="gui-save__clipboard-notification">This code has been saved to your clipboard.</p>
        <textarea
          class="gui-save__textarea"
          name="gui-save-text"
          id="gui-save-text"
          autocomplete="off" autocapitalize="off" spellcheck="false"
        ></textarea>
      </div>
    `;

    const container = document.querySelector('body');
    const newEl = document.createElement('div');
    newEl.classList.add('gui-save');
    newEl.innerHTML = markup;
    container.appendChild(newEl);
    container.insertBefore(newEl, null);
    container.insertBefore(newEl, container.childNodes[0] || null);
  };

  const _addSaveEventListeners = () => {
    Mousetrap.bind('alt+s', _saveMarkup);
    Mousetrap.bind('esc', _closeSave);
    document.querySelector('.gui-save__close').addEventListener('click', _closeSave);
  };

  const _saveMarkup = () => {
    let allSettings = self._getAggregatedSettings();
    allSettings = JSON.stringify(allSettings, null, 1);

    // Turn into a normal javascript object
    allSettings.replace(/\\"/g, '\uFFFF');
    allSettings = allSettings.replace(/"([^"]+)":/g, '$1:').replace(/\uFFFF/g, '\\"');

    // Replace double quotes with single
    allSettings.replace(/"/g, "'");

    // Add to textarea and open
    document.querySelector('.gui-save__textarea').value = allSettings;
    _openSave();
    _copySaveToClipboard();
  };

  const _openSave = () => {
    document.querySelector('.gui-save').classList.add('is-visible');
  };

  const _copySaveToClipboard = () => {
    // Copy to clipboard
    copy(document.querySelector('.gui-save__textarea').value);

    // Show notification message
    const clipboardNotificationEl = document.querySelector('.gui-save__clipboard-notification');
    clipboardNotificationEl.classList.add('is-visible');
    window.setTimeout(() => {
      clipboardNotificationEl.classList.remove('is-visible');
    }, 2000);
  };

  const _closeSave = () => {
    document.querySelector('.gui-save').classList.remove('is-visible');
  };

  const _addStyles = function() {
    let css = document.createElement('style');
    css.type = 'text/css';

    // Add save styles
    css.appendChild(document.createTextNode(`
      .dg.ac {
        z-index: 9999;
      }

      .gui-save {
        display: none;
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        background-color: rgba(255, 255, 255, 0.1);
        z-index: 999;
      }

      .gui-save *, .gui-save *:before, .gui-save *:after {
        box-sizing: inherit;
      }

      .gui-save.is-visible {
        display: flex;
      }

      .gui-save__inner {
        position: relative;
        width: 100%;
        max-width: 400px;
        margin: 20px;
      }

      .gui-save__textarea {
        appearance: none;
        border-radius: 5px;
        border: none;
        background-color: #1f1f1f;
        width: 100%;
        height: 300px;
        padding: 25px 23px;
        border-left: 4px solid #5887da;
        font-family: 'Courier New', Courier, 'Lucida Sans Typewriter', 'Lucida Typewriter', monospace;
        font-size: 14px;
        line-height: 1.5;
        font-weight: normal;
        color: white;
        transition: border-color 0.2s;
      }

      .gui-save__textarea:focus {
        outline: none;
        border-color: #ee907b;
      }

      .gui-save__clipboard-notification {
        font-family: 'Courier New', Courier, 'Lucida Sans Typewriter', 'Lucida Typewriter', monospace;
        font-size: 13px;
        pointer-events: none;
        position: absolute;
        bottom: -45px;
        left: 0;
        right: 0;
        opacity: 0;
        color: #5887da;
        transition: opacity 0.4s;
      }

      .gui-save__clipboard-notification.is-visible {
        opacity: 1;
      }

      .gui-save__close {
        position: absolute;
        width: 35px;
        height: 35px;
        display: flex;
        justify-content: center;
        align-items: center;
        top: 0;
        right: 0;
        z-index: 1;
        font-size: 18px;
        cursor: pointer;
        color: #fff;
      }

      .gui-save__close:active {
        opacity: 0.7;
      }
    `));

    // Add to head
    document.querySelector('head').appendChild(css);
  };

  const _setupMidiInputs = function() {
    Midi.inputs.forEach(input => {
      input.addListener('midimessage', 'all', _onMidiMessage);
    });
  };

  const _onMidiMessage = function(message) {
    let [command, note, velocity] = message.data;
    if (debugMidi) console.log(`command: ${command} / note: ${note} / velocity: ${velocity}`);

    // Check for inclusion in ranged controls
    _controlRangeChange(note, velocity);

    // Check for inclusion in custom controls
    _customControlChange(note, velocity);
  };

  const _controlRangeChange = function(note, velocity) {
    // Get the registered index of the activated control
    const controlIdx = midiConnectRange.indexOf(note);

    // If this note isn't registered, do nothing
    if (controlIdx < 0) return;

    // Find the matching controller
    const controller = self._getNumericControllerAtIndex(controlIdx);

    // If no matching controller, we're done
    if (!controller) return;

    // Update the controller value
    const { __min: min, __max: max, __step: step } = controller;
    const adjustedStep = step
      ? step
      : (max - min) / 127;
    const scaledValue = self._mapRange(0, 127, min, max, velocity);
    const snappedValue = self._snap(adjustedStep.toFixed(5), scaledValue);
    controller.setValue(snappedValue);
  };

  const _customControlChange = function(note, velocity) {
    if (customControls[note]) {
      customControls[note].call(self, velocity);
    }
  };

  const _getAllFolders = () => {
    return folders.length ? folders : [self.gui];
  };

  const _updateControllerColors = function() {
    const allControllers = self.getControllers(false);

    allControllers.forEach((controller, idx) => {
      const colorIdx = Math.floor(idx / self.midiPerColor);
      const color = self.colors[colorIdx];
      const el = controller.domElement;
      const rowEl = el.closest('.cr.number.has-slider');

      // Update styles
      if (rowEl) {
        rowEl.style.borderLeftColor = `${color}`;
        const sliderEl = rowEl.querySelector('.slider-fg');
        sliderEl.style.backgroundColor = `${color}`;
      }
    });
  };

  self._mapRange = function(inMin, inMax, outMin, outMax, value) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  };

  self._snap = function(snapIncrement, value) {
    return Math.round(value / snapIncrement) * snapIncrement;
  };

  self._getNumericControllerAtIndex = function(idx, openOnly = false) {
    // Get all number controllers and attempt to find the one matching the index of this control
    const allControllers = self.getControllers(openOnly);
    const controllerAtIdx = allControllers[idx];
    return typeof controllerAtIdx !== 'undefined' &&
      typeof controllerAtIdx.min !== 'undefined' &&
      typeof controllerAtIdx.max !== 'undefined'
      ? controllerAtIdx
      : null;
  };

  self._getAggregatedSettings = function() {
    const allFolders = _getAllFolders();
    return allFolders.reduce((acc, folder) => {
      acc[folder.name] = folder.__controllers.reduce((controllerAcc, controller) => {
        controllerAcc[controller.property] = controller.getValue();
        return controllerAcc;
      }, {});
      return acc;
    }, {});
  };

  self._controllerValueToMidi = function(controller) {
    const value = controller.getValue();
    const min = controller.__min;
    const max = controller.__max;
    const midiValue = self._mapRange(min, max, 1, 127, value);
    return Math.round(midiValue);
  };


  //
  //   Public Methods
  //
  //////////////////////////////////////////////////////////////////////


  self.add = function(...params) {
    // Add the controller
    const controller = currentFolder.add.apply(currentFolder, params);

    // Update controller colors
    _updateControllerColors();

    // Resync midi controller
    self.syncMidi();

    // Hand back the controller for chaining
    return controller;
  };

  self.addColor = function(...params) {
    // Add the controller
    return currentFolder.addColor.apply(currentFolder, params);
  };

  self.setFolder = function(name) {
    const folder = self.gui.addFolder(name);
    folders.push(folder);
    currentFolder = folder;
    return folder;
  };

  self.getControllers = function(openOnly = false) {
    const allFolders = _getAllFolders();
    const targetFolders = openOnly
      ? allFolders.filter(folder => !folder.closed)
      : allFolders;

    return targetFolders.reduce((acc, gui) => {
      return acc.concat(gui.__controllers);
    }, []);
  };

  self.removeFolder = function(folder) {
    const folderIdx = folders.findIndex(existingFolder => existingFolder.name === folder.name);
    folders.splice(folderIdx, 1);
    self.gui.removeFolder(folder);
    currentFolder = self.gui;
  };

  self.connectMidiRange = function(start, end) {
    for (var idx = start, length = end + 1; idx < length; idx++) {
      midiConnectRange.push(idx);
    }
  };

  self.addControl = function(note, callback) {
    customControls[note] = callback;
  };

  self.destroy = function() {
    self.gui.destroy();
    if (Midi) {
      Midi.inputs.forEach(input => {
        input.removeListener('midimessage', 'all');
      });
      Midi.disable();
    }
  };

  self.clear = function() {
    self.gui.destroy();
    self.gui = new dat.GUI();
    currentFolder = self.gui;
    customControls = {};
  };

  self.hide = function() {
    hidden = true;
    self.gui.hide();
  };

  self.show = function() {
    hidden = false;
    self.gui.show();
  };

  self.toggle = function() {
    hidden = !hidden;
    if (hidden) {
      self.hide();
    } else {
      self.show();
    }
  };

  self.update = function() {
    self.getControllers().forEach(controller => {
      controller.updateDisplay();
    });
  };

  self.configureDevice = function(deviceName) {
    // Limit to supported devices
    const device = supportedMidiOutputDevices[deviceName];
    if (!device || !device.configure) return console.warn(`No built-in configuration is available for "${deviceName}"`);

    device.configure();
  };

  self.syncMidi = function() {
    // If Midi is unavailable, return
    if (!Midi) return;

    midiConnectRange.forEach((midiIdx, idx) => {
      // Get numeric GUI controller at corresponding position
      const controller = self._getNumericControllerAtIndex(idx);

      // New
      midiReady.then(() => {
        Midi.outputs.forEach(output => {
          // Limit to supported devices
          const device = supportedMidiOutputDevices[output.name];
          if (!device) return;

          if (controller) {
            // Update the midi controller to the GUI controllers initial value
            const midiValue = self._controllerValueToMidi(controller);
            if (device.sync) device.sync(output, midiIdx, midiValue);
          } else {
            // If no corresponding GUI controller is found, zero out the value at position
            if (device.clear) device.clear(output, midiIdx);
          }
        });
      });
    });
  };


  //
  //   Initialize
  //
  //////////////////////////////////////////////////////////////////////

  _init();

  // Return the Object
  return self;
};

export default Gui;
