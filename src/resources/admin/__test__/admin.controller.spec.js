import controllers from '../admin.controller';

const isFunction = f => typeof f == 'function';

describe('admin controller', () => {
  test('has crud controllers', () => {
    const crudMethods = [
      'getOne',
      'getMany',
      'createOne',
      'updateOne',
      'removeOne'
    ];

    crudMethods.forEach(name =>
      expect(isFunction(controllers[name])).toBe(true)
    );
  });

  test('has signin controller', () => {
    expect(isFunction(controllers.signin)).toBe(true);
  });

  test('has signup controller', () => {
    expect(isFunction(controllers.signup)).toBe(true);
  });
});
