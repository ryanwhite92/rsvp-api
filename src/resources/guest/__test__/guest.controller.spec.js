import controllers from '../guest.controller';

const isFunction = f => typeof f == 'function';

describe('guest controllers', () => {
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

  test('has updateRsvp controller', () => {
    expect(isFunction(controllers.updateRsvp)).toBe(true);
  });
});
