import * as dat from 'dat.gui';
/**
 * Assists in controlling properties
 *
 * @class    Gui
 * @param    {object}  options  Options for the object
 * @return   {object}  The object
 */
declare type Options = {
    enabled: boolean;
    midi: boolean;
    colors: string[];
    midiPerColor: number;
};
declare const Gui: (options: Options) => {
    enabled: boolean;
    gui: dat.GUI;
    midiPerColor: number;
    midi: boolean;
    colors: string[];
    add: (...params: any[]) => any;
    addColor: (...params: any[]) => dat.GUI;
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
    _mapRange: (inMin: number, inMax: number, outMin: number, outMax: number, value: number) => number;
    _snap: (snapIncrement: number, value: number) => number;
    _getNumericControllerAtIndex: (idx: number, openOnly?: boolean) => any;
    _getAggregatedSettings: () => object;
    _controllerValueToMidi: (controller: dat.GUIController & {
        __min: number;
        __max: number;
    }) => number;
} & Options;
export default Gui;
