import Gui from '../dist/gui.umd';

describe('Gui', () => {
  let settings;
  let gui;

  beforeEach(() => {
    settings = {
      alpha: 1,
      beta: 1,
      gamma: 1,
      delta: 1,
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

  test('Get all controllers', () => {
    gui.add(settings, 'alpha', 0, 200);
    gui.add(settings, 'beta', 0, 200);
    const controllers = gui.getControllers();
    expect(controllers).toHaveLength(2);
  });

  test('Get numeric controller at index', () => {
    const folder1 = gui.setFolder('one');
    gui.add(settings, 'alpha', 0, 200);
    gui.add(settings, 'beta', 0, 200);

    const folder2 = gui.setFolder('two');
    gui.add(settings, 'gamma', 0, 200);
    gui.add(settings, 'delta', 0, 200);

    folder2.open();
    expect(gui._getNumericControllerAtIndex(0).property).toBe('gamma');
    expect(gui._getNumericControllerAtIndex(1).property).toBe('delta');
    folder1.open();
    expect(gui._getNumericControllerAtIndex(0).property).toBe('alpha');
    expect(gui._getNumericControllerAtIndex(1).property).toBe('beta');
    expect(gui._getNumericControllerAtIndex(2).property).toBe('gamma');
    expect(gui._getNumericControllerAtIndex(3).property).toBe('delta');
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
        beta: 1,
      },
      two: {
        gamma: 1,
        delta: 1,
      },
    });
  });

  test('Clear everything', () => {
    gui.add(settings, 'alpha', 0, 200);
    gui.setFolder('other');
    gui.add(settings, 'beta', 0, 200);
    gui.clear();

    // Controllers are gone
    const controllers = gui.getControllers();
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