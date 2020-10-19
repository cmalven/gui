# GUI

An abstraction layer over [dat.gui](https://github.com/dataarts/dat.gui) that simplifies use and adds automatic support through MIDI devices.

---

## Install

```sh
npm i @malven/gui
```

## Use

### Basic Example

```js
// ---------------------------------------------------------------
// Initial Setup
// ---------------------------------------------------------------
window.APP = {
  devMode: true
};

if (APP.devMode) {
  APP.gui = new Gui();

  // Connect Knobs and for the Midi Fighter Twister MIDI controler (https://store.djtechtools.com/products/midi-fighter-twister?gclid=Cj0KCQjw8rT8BRCbARIsALWiOvRGft2wOKqro0RY2mWY9ezcOwjdcrcwiGX5YDxpo7Pvh9mxCaibqd0aAmcyEALw_wcB)
  APP.gui.connectMidiRange(0, 15);

  // Connect Knobs and Sliders for the Korg nonKONTROL2 MIDI controller (https://www.korg.com/us/products/computergear/nanokontrol2/)
  // APP.gui.connectMidiRange(16, 23);
  // APP.gui.connectMidiRange(0, 7);

  // Initially hide the GUI
  APP.gui.hide();

  // Add a MIDI control to toggle UI visibility (or for any other custom command you want)
  APP.gui.addControl(43, (velocity) => {
    if (velocity === 127) APP.gui.toggle();
  });
}


// ---------------------------------------------------------------
// Add Controls
// ---------------------------------------------------------------

let settings = {
    value1: 50,
    value2: 100,
    value3: 200
};

const createGui = () => {
  if (!APP.devMode) return;

  APP.gui.add(settings, 'value1', 0, 100);
  APP.gui.add(settings, 'value2', 50, 150);

  // Add a new folder: any controls added will now appear in this folder
  APP.gui.setFolder('other');
  APP.gui.add(settings, 'value3', 150, 250).onChange(val => {
    console.log(val);
});
```

### Viewing values and copying to clipboard

The keyboard shorcut `Option-S` (`Alt-S` on Windows) will display all aggregated values and copy them to your clipboard.

### Dynamic Loading using Webpack

GUI isn't always wanted in production. Below is a nice approach to reducing filesize and eliminating unused functionality by loading GUI dynamically, and only when desired. Requires the use of [webpack](https://webpack.js.org) with the appropriate setup.

```js
window.APP = {
  devMode: true
};

const readyPromises = [];

if (APP.devMode) {
  const guiPromise = import(/* webpackChunkName: "gui" */ '@malven/gui').then(({ default: Gui }) => {
    APP.gui = new Gui();
    // Do anything else you want with GUI, as shown in basic example above
  }).catch(error => 'An error occurred while loading GUI');
  readyPromises.push(guiPromise);
}

Promise.all(readyPromises).then(() => {
  // Create the objects that will ultimately end up making use of GUI.  
  new Foo();
});

```

### Methods

`gui.add()`
Add a new control to the current folder.

`gui.addColor()`
Adds a new color pick control.

`gui.setFolder(name)`
Adds a new folder with the given name and sets that as the current folder.

`gui.removeFolder(folder)`
Removes the given folder and sets the current folder to the base gui.

`gui.connectMidiRange(start, end)`
Adds all midi values between the `start` and `end` range as MIDI controls. Each MIDI control in the range will automatically be connected to the GUI controller with a corresponding index (if one exists).

`gui.addControl(value, callback)`
Adds a listener for the given MIDI value and triggers the callback when it receives that value. The callback will be called with a `velocity` param.

`gui.destroy()`
Completely destroys the GUI, removing all controllers and listeners.

`gui.clear()`
Clears all folders, controllers, and listeners from the GUI, but does not destroy it.

`gui.update()`
Updates the display of all controllers to match the settings they are connected to.

`gui.hide()`
Hides the GUI.

`gui.show()`
Shows the GUI.

`gui.toggle()`
Toggles the visibility of the GUI. E.g. if it is hidden it will become visible and vice versa.


## Release

- Bump `version` in `package.json` appropriately.
- Create a new Github release identifying changes.
- A Github Action will automatically run tests and publish the update.

## Test

```sh
# Run tests once
npm test

# Build and run tests whenever files change
npm run dev
```
