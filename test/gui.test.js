import Gui from '../dist/gui.umd';

describe('Gui', () => {
  let settings;
  let gui;

  beforeEach(() => {
    settings = {
      alpha: 1,
      beta: 2,
      gamma: 3,
      delta: 4,
      color: '#ff0000',
    };
    gui = new Gui();
  });

  afterEach(() => {
    settings = null;
    gui.destroy();
  });

  test('Basic adding', () => {
    const control = gui.add(settings, 'alpha', 0, 200);
    expect(control).toMatchObject({
      initialValue: 1,
      property: 'alpha',
    });
  });

  test('Get midi value from control value', () => {
    const controller1 = gui.add(settings, 'alpha', 0, 2);
    const controller2 = gui.add(settings, 'beta', 0, 2);
    const midiValue1= gui._controllerValueToMidi(controller1);
    const midiValue2= gui._controllerValueToMidi(controller2);
    expect(midiValue1).toBe(64);
    expect(midiValue2).toBe(127);
  });

  test('Adding a color control', () => {
    const control = gui.addColor(settings, 'color');
    expect(control).toMatchObject({
      initialValue: '#ff0000',
      property: 'color',
    });
  });

  test('Adding and removing a folder', () => {
    // Add
    const folder = gui.setFolder('other');
    gui.add(settings, 'beta', 0, 200);
    expect(gui.gui.__folders).toMatchObject({
      other: expect.anything(),
    });

    // Remove
    gui.removeFolder(folder);
    expect(gui.gui.__folders).toEqual({});
  });

  test('Get all controllers (open only)', () => {
    gui.setFolder('one');
    gui.add(settings, 'alpha', 0, 200);
    gui.add(settings, 'beta', 0, 200);

    const folder2 = gui.setFolder('two');
    gui.add(settings, 'gamma', 0, 200);
    gui.add(settings, 'delta', 0, 200);
    folder2.open();

    const controllers = gui.getControllers(true);
    expect(controllers).toHaveLength(2);
  });

  test('Get all controllers (all)', () => {
    gui.setFolder('one');
    gui.add(settings, 'alpha', 0, 200);
    gui.add(settings, 'beta', 0, 200);

    gui.setFolder('two');
    gui.add(settings, 'gamma', 0, 200);
    gui.add(settings, 'delta', 0, 200);

    const controllers = gui.getControllers(false);
    expect(controllers).toHaveLength(4);
  });

  test('Get numeric controller at index (open only)', () => {
    const folder1 = gui.setFolder('one');
    gui.add(settings, 'alpha', 0, 200);
    gui.add(settings, 'beta', 0, 200);

    const folder2 = gui.setFolder('two');
    gui.add(settings, 'gamma', 0, 200);
    gui.add(settings, 'delta', 0, 200);

    folder2.open();
    expect(gui._getNumericControllerAtIndex(0, true).property).toBe('gamma');
    expect(gui._getNumericControllerAtIndex(1, true).property).toBe('delta');
    folder1.open();
    expect(gui._getNumericControllerAtIndex(0, true).property).toBe('alpha');
    expect(gui._getNumericControllerAtIndex(1, true).property).toBe('beta');
    expect(gui._getNumericControllerAtIndex(2, true).property).toBe('gamma');
    expect(gui._getNumericControllerAtIndex(3, true).property).toBe('delta');
    expect(gui._getNumericControllerAtIndex(4, true)).toBeNull();
  });

  test('Get numeric controller at index (all)', () => {
    const folder1 = gui.setFolder('one');
    gui.add(settings, 'alpha', 0, 200);
    gui.add(settings, 'beta', 0, 200);

    const folder2 = gui.setFolder('two');
    gui.add(settings, 'gamma', 0, 200);
    gui.add(settings, 'delta', 0, 200);

    folder2.open();
    expect(gui._getNumericControllerAtIndex(0, false).property).toBe('alpha');
    expect(gui._getNumericControllerAtIndex(1, false).property).toBe('beta');
    expect(gui._getNumericControllerAtIndex(2, false).property).toBe('gamma');
    expect(gui._getNumericControllerAtIndex(3, false).property).toBe('delta');
    folder1.open();
    expect(gui._getNumericControllerAtIndex(0, false).property).toBe('alpha');
    expect(gui._getNumericControllerAtIndex(1, false).property).toBe('beta');
    expect(gui._getNumericControllerAtIndex(2, false).property).toBe('gamma');
    expect(gui._getNumericControllerAtIndex(3, false).property).toBe('delta');
  });

  test('Get aggregated settings', () => {
    gui.setFolder('one');
    gui.add(settings, 'alpha', 0, 200);
    gui.add(settings, 'beta', 0, 200);

    gui.setFolder('two');
    gui.add(settings, 'gamma', 0, 200);
    gui.add(settings, 'delta', 0, 200);

    const allSettings = gui._getAggregatedSettings();
    expect(allSettings).toEqual({
      one: {
        alpha: 1,
        beta: 2,
      },
      two: {
        gamma: 3,
        delta: 4,
      },
    });
  });

  test('Clear everything', () => {
    gui.add(settings, 'alpha', 0, 200);
    gui.setFolder('other');
    gui.add(settings, 'beta', 0, 200);
    gui.clear();

    // Controllers are gone
    const controllers = gui.getControllers(true);
    expect(controllers).toHaveLength(0);

    // Folders are gone
    expect(gui.gui.__folders).toEqual({});
  });

  test('Show, hide, and toggle controller', () => {
    gui.hide();
    expect(gui.gui.domElement.style.display).toBe('none');
    gui.show();
    expect(gui.gui.domElement.style.display).toBe('');
    gui.toggle();
    expect(gui.gui.domElement.style.display).toBe('none');
  });

  test('Snaps to nearest increment of value', () => {
    expect(gui._snap(0.5, 0.2)).toBe(0);
    expect(gui._snap(0.5, 0.4)).toBe(0.5);
    expect(gui._snap(5, 2)).toBe(0);
    expect(gui._snap(5, 3)).toBe(5);
  });
});