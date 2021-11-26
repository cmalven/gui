import * as dat from 'dat.gui';
import WebMidi, { Output } from 'webmidi';
import * as Mousetrap from 'mousetrap';
import clipboard from 'clipboardy';

type Options = {
  midi?: boolean;
  colors?: string[];
  midiPerColor?: number;
}

type Target = Record<string, unknown>;

type Setting = { [key: string]: number | boolean };

type GUIController = dat.GUIController & {
  __min?: number;
  __max?: number;
  __step?: number;
}

type Folders = { [key: string]: Setting };

type SupportedMidiOutputDevices = { [key: string]: {
    sync?: (output: Output, midiIdx: number, midiValue: number) => void,
    clear?: (output: Output, midiIdx: number) => void,
    configure?: () => void,
  }};

/**
 * An abstraction layer over dat.gui that simplifies use and adds automatic support through MIDI devices.
 *
 * @class    Gui
 * @param    {object}  options  Options for the GUI
 * @return   {object}  GUI object
 */

class Gui {
  //
  //   Public Vars
  //
  //////////////////////////////////////////////////////////////////////

  gui = new dat.GUI;
  midiPerColor: number;
  midi: boolean;
  colors: string[];

  //
  //   Private Vars
  //
  //////////////////////////////////////////////////////////////////////

  folders:dat.GUI[] = [];
  currentFolder = this.gui;
  midiConnectRange: number[] = [];
  customControls: { [key: number]: () => void } = {};
  debugMidi = false;
  hidden = false;
  Midi: typeof WebMidi = null;
  midiReady: Promise<typeof WebMidi | void>;

  // MIDI output devices that we will attempt to automatically sync with GUI
  supportedMidiOutputDevices: SupportedMidiOutputDevices = {
    'Midi Fighter Twister': {
      sync: (output: Output, midiIdx: number, midiValue: number) => {
        output.sendControlChange(midiIdx, midiValue, 1);
        // Set RGB to max brightness
        output.sendControlChange(midiIdx, 47, 6);
      },
      clear: (output: Output, midiIdx: number) => {
        output.sendControlChange(midiIdx, 0, 1);
        // Set RGB to low brightness
        output.sendControlChange(midiIdx, 20, 6);
      },
      configure: () => {
        this.connectMidiRange(0, 15);
      },
    },
    'nanoKONTROL2 CTRL': {
      configure: () => {
        this.connectMidiRange(16, 23);
        this.connectMidiRange(0, 7);
      },
    },
  };

  constructor(options: Options = {}) {
    const defaultOptions: Options = {
      midi: true,
      colors: [
        '#ee907b',
        '#2ed9c3',
        '#4888f5',
        '#aa82ff',
      ],
      midiPerColor: 4,
    };
    Object.assign(this, defaultOptions, options);

    this._init();
  }


  //
  //   Public Methods
  //

  /**
   * Add a new control to the current folder.
   */
  add = (target: Target, key: string, minValue?: number, maxValue?: number, step?: number) => {
    // Add the controller
    const controller = this.currentFolder.add(target, key, minValue, maxValue, step);

    // Update controller colors
    this._updateControllerColors();

    // Resync midi controller
    this.syncMidi();

    // Hand back the controller for chaining
    return controller;
  };

  /**
   * Adds a new color picker control to the current folder.
   */
  addColor = (target: Target, key: string): GUIController => {
    // Add the controller
    return this.currentFolder.addColor(target, key);
  };

  /**
   * Adds a new folder with the given name and sets that as the current folder.
   */
  setFolder = (name: string) => {
    const folder = this.gui.addFolder(name);
    this.folders.push(folder);
    this.currentFolder = folder;
    return folder;
  };

  /**
   * Returns an array of all GUI controllers.
   * Useful for iterating over values or setting up `.change()` listeners.
   */
  getControllers = (openOnly = false): GUIController[] => {
    const allFolders = this._getAllFolders();
    const targetFolders = openOnly
      ? allFolders.filter(folder => !folder.closed)
      : allFolders;

    return targetFolders.reduce((acc, gui) => {
      return acc.concat(gui.__controllers);
    }, []);
  };

  /**
   * Removes the given folder and sets the current folder to the base GUI.
   */
  removeFolder = (folder: dat.GUI) => {
    const folderIdx = this.folders.findIndex(existingFolder => existingFolder.name === folder.name);
    this.folders.splice(folderIdx, 1);
    this.gui.removeFolder(folder);
    this.currentFolder = this.gui;
  };

  /**
   * Adds all midi values between the `start` and `end` range as MIDI controls.
   * Each MIDI control in the range will automatically be connected to the
   * GUI controller with a corresponding index (if one exists).
   */
  connectMidiRange = (start: number, end: number) => {
    for (let idx = start, length = end + 1; idx < length; idx++) {
      this.midiConnectRange.push(idx);
    }
  };

  /**
   * Adds a listener for the given MIDI value and triggers the callback
   * when it receives that value. The callback will be called with a velocity param.
   */
  addControl = (note: number, callback:() => void) => {
    this.customControls[note] = callback;
  };

  /**
   * Completely destroys the GUI, removing all controllers and listeners.
   */
  destroy = () => {
    this.gui.destroy();
    if (this.Midi) {
      this.Midi.inputs.forEach(input => {
        input.removeListener('midimessage', 'all');
      });
      this.Midi.disable();
    }
  };

  /**
   * Clears all folders, controllers, and listeners from the GUI, but does not destroy it.
   */
  clear = () => {
    this.gui.destroy();
    this.gui = new dat.GUI();
    this.currentFolder = this.gui;
    this.customControls = {};
  };

  /**
   * Hides the GUI.
   */
  hide = () => {
    this.hidden = true;
    this.gui.hide();
  };

  /**
   * Shows the GUI.
   */
  show = () => {
    this.hidden = false;
    this.gui.show();
  };

  /**
   * Toggles the visibility of the GUI. E.g. if it is hidden it will become visible and vice versa.
   */
  toggle = () => {
    this.hidden = !this.hidden;
    if (this.hidden) {
      this.hide();
    } else {
      this.show();
    }
  };

  /**
   * Update the GUI to reflect all values on the target object.
   */
  update = () => {
    this.getControllers().forEach(controller => {
      controller.updateDisplay();
    });
  };

  /**
   * Automatically set up MIDI configuration for a supported device.
   */
  configureDevice = (deviceName: 'Midi Fighter Twister' | 'nanoKONTROL2 CTRL') => {
    // Limit to supported devices
    const device = this.supportedMidiOutputDevices[deviceName];
    if (!device || !device.configure) return console.warn(`No built-in configuration is available for "${deviceName}"`);

    device.configure();
  };


  //
  //   Private Methods
  //

  private syncMidi = () => {
    // If Midi is unavailable, return
    if (!this.Midi) return;

    this.midiConnectRange.forEach((midiIdx, idx) => {
      // Get numeric GUI controller at corresponding position
      const controller = this._getNumericControllerAtIndex(idx);

      // New
      this.midiReady.then(() => {
        this.Midi.outputs.forEach(output => {
          // Limit to supported devices
          const device = this.supportedMidiOutputDevices[output.name];
          if (!device) return;

          if (controller) {
            // Update the midi controller to the GUI controllers initial value
            const midiValue = this._controllerValueToMidi(controller);
            if (device.sync) device.sync(output, midiIdx, midiValue);
          } else {
            // If no corresponding GUI controller is found, zero out the value at position
            if (device.clear) device.clear(output, midiIdx);
          }
        });
      });
    });
  };

  private _mapRange = (inMin: number, inMax: number, outMin: number, outMax: number, value: number) => {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  };

  private _snap = (snapIncrement: number, value: number): number => {
    return Math.round(value / snapIncrement) * snapIncrement;
  };

  private _getNumericControllerAtIndex = (idx:number, openOnly = false): GUIController => {
    // Get all number controllers and attempt to find the one matching the index of this control
    const allControllers = this.getControllers(openOnly);
    const controllerAtIdx = allControllers[idx];
    return typeof controllerAtIdx !== 'undefined' &&
    typeof controllerAtIdx.min !== 'undefined' &&
    typeof controllerAtIdx.max !== 'undefined'
      ? controllerAtIdx
      : null;
  };

  private _getAggregatedSettings = (): object => {
    const allFolders = this._getAllFolders();
    return allFolders.reduce((acc: Folders, folder: dat.GUI) => {
      acc[folder.name] = folder.__controllers.reduce((controllerAcc: Setting, controller: GUIController) => {
        controllerAcc[controller.property] = controller.getValue();
        return controllerAcc;
      }, {});
      return acc;
    }, {});
  };

  private _controllerValueToMidi = (controller: GUIController) => {
    const value = controller.getValue();
    const min = controller.__min;
    const max = controller.__max;
    const midiValue = this._mapRange(min, max, 1, 127, value);
    return Math.round(midiValue);
  };

  private _init = () => {
    this._addMidi();
    this._addEventListeners();
    this._addSaveMarkup();
    this._addSaveEventListeners();
    this._addStyles();
  };

  private _addMidi = () => {
    if (!this.midi) return;

    this.midiReady = new Promise<typeof WebMidi>((res) => {
      const webmidiEnabled = navigator.requestMIDIAccess;

      if (webmidiEnabled) {
        this.Midi = WebMidi;
        this.Midi.enable(err => {
          if (err) {
            console.error('WebMIDI is not supported in this browser.');
          } else {
            console.log('MIDI devices successfully connected.');
            this._setupMidiInputs();
            res(this.Midi);
          }
        }, true);
      }
    })
      .catch(err => {
        console.error(err);
      });
  };

  private _addEventListeners = () => {
    document.addEventListener('keydown', ({ keyCode }) => {
      // If option/alt, enable debugging
      if (keyCode === 18) this.debugMidi = true;
    });

    document.addEventListener('keyup', ({ keyCode }) => {
      if (keyCode === 18) this.debugMidi = false;
    });

    document.addEventListener('keyup', ({ keyCode }) => {
      if (keyCode === 17) this.toggle();
    });
  };

  private _addSaveMarkup = () => {
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

  private _addSaveEventListeners = () => {
    Mousetrap.bind('alt+s', this._saveMarkup);
    Mousetrap.bind('esc', this._closeSave);
    document.querySelector('.gui-save__close').addEventListener('click', this._closeSave);
  };

  private _saveMarkup = () => {
    const allSettings: object = this._getAggregatedSettings();
    const allSettingsJson: string = JSON.stringify(allSettings, null, 1);

    // Turn into a normal javascript object
    let allSettingsFormatted: string = allSettingsJson.replace(/\\"/g, '\uFFFF');
    allSettingsFormatted = allSettingsFormatted.replace(/"([^"]+)":/g, '$1:').replace(/\uFFFF/g, '\\"');

    // Replace double quotes with single
    allSettingsFormatted.replace(/"/g, "'");

    // Add to textarea and open
    const textarea: HTMLTextAreaElement = document.querySelector('.gui-save__textarea');
    textarea.value = allSettingsFormatted;
    this._openSave();
    this._copySaveToClipboard();
  };

  private _openSave = () => {
    document.querySelector('.gui-save').classList.add('is-visible');
  };

  private _copySaveToClipboard = () => {
    // Copy to clipboard
    const textarea: HTMLTextAreaElement = document.querySelector('.gui-save__textarea');
    clipboard.write(textarea.value);

    // Show notification message
    const clipboardNotificationEl = document.querySelector('.gui-save__clipboard-notification');
    clipboardNotificationEl.classList.add('is-visible');
    window.setTimeout(() => {
      clipboardNotificationEl.classList.remove('is-visible');
    }, 2000);
  };

  private _closeSave = () => {
    document.querySelector('.gui-save').classList.remove('is-visible');
  };

  private _addStyles = () => {
    const css = document.createElement('style');
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

  private _setupMidiInputs = () => {
    this.Midi.inputs.forEach(input => {
      input.addListener('midimessage', 'all', this._onMidiMessage);
    });
  };

  private _onMidiMessage = (message: { data: Uint8Array }) => {
    const [command, note, velocity] = message.data;
    if (this.debugMidi) console.log(`command: ${command} / note: ${note} / velocity: ${velocity}`);

    // Check for inclusion in ranged controls
    this._controlRangeChange(note, velocity);

    // Check for inclusion in custom controls
    this._customControlChange(note, velocity);
  };

  private _controlRangeChange = (note: number, velocity: number) => {
    // Get the registered index of the activated control
    const controlIdx = this.midiConnectRange.indexOf(note);

    // If this note isn't registered, do nothing
    if (controlIdx < 0) return;

    // Find the matching controller
    const controller = this._getNumericControllerAtIndex(controlIdx);

    // If no matching controller, we're done
    if (!controller) return;

    // Update the controller value
    const { __min: min, __max: max, __step: step } = controller;
    const adjustedStep: number = step
      ? step
      : (max - min) / 127;
    const scaledValue = this._mapRange(0, 127, min, max, velocity);
    const snappedValue = this._snap(Number(adjustedStep.toFixed(5)), scaledValue);
    controller.setValue(snappedValue);
  };

  private _customControlChange = (note: number, velocity: number) => {
    if (this.customControls[note]) {
      this.customControls[note].call(self, velocity);
    }
  };

  private _getAllFolders = () => {
    return this.folders.length ? this.folders : [this.gui];
  };

  private _updateControllerColors = () => {
    const allControllers = this.getControllers(false);

    allControllers.forEach((controller, idx) => {
      const colorIdx = Math.floor(idx / this.midiPerColor);
      const color = this.colors[colorIdx];
      const el = controller.domElement;
      const rowEl: HTMLElement = el.closest('.cr.number.has-slider');

      // Update styles
      if (rowEl) {
        rowEl.style.borderLeftColor = `${color}`;
        const sliderEl: HTMLElement = rowEl.querySelector('.slider-fg');
        sliderEl.style.backgroundColor = `${color}`;
      }
    });
  };
}

export default Gui;
