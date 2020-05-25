import dat from 'dat.gui';
import WebMidi from 'webmidi';

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
    midiPerColor: 2,
    colors: [
      '#ee907b',
      '#2ed9c3',
      '#5887da',
      '#b4b3df'
    ]
  }, options);


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


  //
  //   Private Methods
  //
  //////////////////////////////////////////////////////////////////////

  const _init = function() {
    _addMidi();
    _addEventListeners();
    _addStyles();
  };

  const _addMidi = function() {
    const webmidiEnabled = navigator.requestMIDIAccess && (!window.env || window.env !== 'production');

    if (webmidiEnabled) {
      Midi = WebMidi;
      Midi.enable(err => {
        if (err) {
          console.error('WebMIDI is not supported in this browser.');
        } else {
          console.log('MIDI devices successfully connected.');
          _setupMidiInputs();
        }
      });
    }
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

  const _addStyles = function() {
    let css = document.createElement('style');
    css.type = 'text/css';
    let count = 1;
    self.colors.forEach((color, idx) => {
      for (var i = 0, length = self.midiPerColor; i < length; i++) {
        css.appendChild(document.createTextNode(`
          .dg .cr:nth-child(${self.colors.length * self.midiPerColor}n + ${count}) {
            border-left-color: ${color};
          }
        `));
        count++;
      }
    });
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

  self._mapRange = function(inMin, inMax, outMin, outMax, value) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  };

  self._snap = function(snapIncrement, value) {
    return Math.round(value / snapIncrement) * snapIncrement;
  };

  self._getNumericControllerAtIndex = function(idx) {
    // Get all number controllers and attempt to find the one matching the index of this control
    const allControllers = self.getControllers().filter(controller => {
      return typeof controller.min !== undefined && typeof controller.max !== undefined;
    });
    const controller = allControllers[idx];
    return controller;
  };


  //
  //   Public Methods
  //
  //////////////////////////////////////////////////////////////////////


  self.add = function(...params) {
    // Add the controller
    const controller = currentFolder.add.apply(currentFolder, params);

    // Hand back the controller for chaining
    return controller;
  };

  self.addColor = function(...params) {
    // Add the controller
    const controller = currentFolder.addColor.apply(currentFolder, params);

    // Hand back the controller for chaining
    return controller;
  };

  self.setFolder = function(name) {
    const folder = self.gui.addFolder(name);
    folders.push(folder);
    currentFolder = folder;
    return folder;
  };

  self.getControllers = function() {
    const allFolders = folders.length ? folders : [self.gui];
    const openFolders = allFolders.filter(folder => !folder.closed);

    const allControllers = openFolders.reduce((acc, gui) => {
      return acc.concat(gui.__controllers);
    }, []);

    return allControllers;
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


  //
  //   Initialize
  //
  //////////////////////////////////////////////////////////////////////

  _init();

  // Return the Object
  return self;
};

export default Gui;
