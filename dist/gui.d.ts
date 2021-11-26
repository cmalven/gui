import * as dat from 'dat.gui';
import WebMidi, { Output } from 'webmidi';
declare type Options = {
    midi?: boolean;
    colors?: string[];
    midiPerColor?: number;
};
declare type Target = Record<string, unknown>;
declare type SupportedMidiOutputDevices = {
    [key: string]: {
        sync?: (output: Output, midiIdx: number, midiValue: number) => void;
        clear?: (output: Output, midiIdx: number) => void;
        configure?: () => void;
    };
};
/**
 * Assists in controlling properties
 *
 * @class    Gui
 * @param    {object}  options  Options for the object
 * @return   {object}  The object
 */
declare class Gui {
    enabled: boolean;
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
    add: (target: Target, key: string, minValue?: number, maxValue?: number, step?: number) => dat.GUIController;
    addColor: (target: Target, key: string) => dat.GUIController;
    setFolder: (name: string) => dat.GUI;
    getControllers: (openOnly?: boolean) => any[];
    removeFolder: (folder: dat.GUI) => void;
    connectMidiRange: (start: number, end: number) => void;
    addControl: (note: number, callback: () => void) => void;
    destroy: () => void;
    clear: () => void;
    hide: () => void;
    show: () => void;
    toggle: () => void;
    update: () => void;
    configureDevice: (deviceName: string) => void;
    syncMidi: () => void;
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
