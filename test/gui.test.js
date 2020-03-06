import Gui from '../dist/gui.umd';

describe('Gui', () => {
  let settings;
  let gui;

  beforeEach(() => {
    settings = {
      foo: 1,
      bar: 1,
      color: '#ff0000'
    };
    gui = new Gui();
  });

  afterEach(() => {
    settings = null;
    gui.destroy();
  });

  test('Basic adding', () => {
    const control = gui.add(settings, 'foo', 0, 200);
    expect(control).toMatchObject({
      initialValue: 1,
      property: 'foo'
    });
  });

  test('Adding a color control', () => {
    const control = gui.addColor(settings, 'color');
    expect(control).toMatchObject({
      initialValue: '#ff0000',
      property: 'color'
    });
  });

  test('Adding and removing a folder', () => {
    // Add
    const folder = gui.setFolder('other');
    gui.add(settings, 'bar', 0, 200);
    expect(gui.gui.__folders).toMatchObject({
      other: expect.anything()
    });

    // Remove
    gui.removeFolder(folder);
    expect(gui.gui.__folders).toEqual({});
  });

  test('Get all controllers', () => {
    gui.add(settings, 'foo', 0, 200);
    gui.add(settings, 'bar', 0, 200);
    const controllers = gui.getControllers();
    expect(controllers).toHaveLength(2);
  });

  test('Clear everything', () => {
    gui.add(settings, 'foo', 0, 200);
    gui.setFolder('other');
    gui.add(settings, 'bar', 0, 200);
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
});