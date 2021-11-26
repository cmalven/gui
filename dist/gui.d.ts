import * as dat from 'dat.gui';
import WebMidi, { Output } from 'webmidi';
declare type Options = {
    midi?: boolean;
    colors?: string[];
    midiPerColor?: number;
};
declare type Target = Record<string, unknown>;
declare type GUIController = dat.GUIController & {
    __min?: number;
    __max?: number;
    __step?: number;
};
declare type SupportedMidiOutputDevices = {
    [key: string]: {
        sync?: (output: Output, midiIdx: number, midiValue: number) => void;
        clear?: (output: Output, midiIdx: number) => void;
        configure?: () => void;
    };
};
/**
 * An abstraction layer over dat.gui that simplifies use and adds automatic support through MIDI devices.
 *
 * @class    Gui
 * @param    {object}  options  Options for the GUI
 * @return   {object}  GUI object
 */
declare class Gui {
    gui: dat.GUI;
    midiPerColor: number;
    midi: boolean;
    colors: string[];
    folders: dat.GUI[];
    currentFolder: dat.GUI;
    midiConnectRange: number[];
    customControls: {
        [key: number]: () => void;
    };
    debugMidi: boolean;
    hidden: boolean;
    Midi: typeof WebMidi;
    midiReady: Promise<typeof WebMidi | void>;
    supportedMidiOutputDevices: SupportedMidiOutputDevices;
    constructor(options?: Options);
    /**
     * Add a new control to the current folder.
     */
    add: (target: Target, key: string, minValue?: number, maxValue?: number, step?: number) => dat.GUIController;
    /**
     * Adds a new color picker control to the current folder.
     */
    addColor: (target: Target, key: string) => GUIController;
    /**
     * Adds a new folder with the given name and sets that as the current folder.
     */
    setFolder: (name: string) => dat.GUI;
    /**
     * Returns an array of all GUI controllers.
     * Useful for iterating over values or setting up `.change()` listeners.
     */
    getControllers: (openOnly?: boolean) => GUIController[];
    /**
     * Removes the given folder and sets the current folder to the base GUI.
     */
    removeFolder: (folder: dat.GUI) => void;
    /**
     * Adds all midi values between the `start` and `end` range as MIDI controls.
     * Each MIDI control in the range will automatically be connected to the
     * GUI controller with a corresponding index (if one exists).
     */
    connectMidiRange: (start: number, end: number) => void;
    /**
     * Adds a listener for the given MIDI value and triggers the callback
     * when it receives that value. The callback will be called with a velocity param.
     */
    addControl: (note: number, callback: () => void) => void;
    /**
     * Completely destroys the GUI, removing all controllers and listeners.
     */
    destroy: () => void;
    /**
     * Clears all folders, controllers, and listeners from the GUI, but does not destroy it.
     */
    clear: () => void;
    /**
     * Hides the GUI.
     */
    hide: () => void;
    /**
     * Shows the GUI.
     */
    show: () => void;
    /**
     * Toggles the visibility of the GUI. E.g. if it is hidden it will become visible and vice versa.
     */
    toggle: () => void;
    /**
     * Update the GUI to reflect all values on the target object.
     */
    update: () => void;
    /**
     * Automatically set up MIDI configuration for a supported device.
     */
    configureDevice: (deviceName: 'Midi Fighter Twister' | 'nanoKONTROL2 CTRL') => void;
    private syncMidi;
    private _mapRange;
    private _snap;
    private _getNumericControllerAtIndex;
    private _getAggregatedSettings;
    private _controllerValueToMidi;
    private _init;
    private _addMidi;
    private _addEventListeners;
    private _addSaveMarkup;
    private _addSaveEventListeners;
    private _saveMarkup;
    private _openSave;
    private _copySaveToClipboard;
    private _closeSave;
    private _addStyles;
    private _setupMidiInputs;
    private _onMidiMessage;
    private _controlRangeChange;
    private _customControlChange;
    private _getAllFolders;
    private _updateControllerColors;
}
export default Gui;
