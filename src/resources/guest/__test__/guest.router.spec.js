import router from '../guest.router';

describe('guest router', () => {
  test('has crud routes', () => {
    const routes = [
      { path: '/', method: 'get' },
      { path: '/', method: 'post' },
      { path: '/:id', method: 'get' },
      { path: '/:id', method: 'delete' },
      { path: '/:id', method: 'put' },
      { path: '/:id/signin', method: 'post' }
    ];

    routes.forEach(route => {
      const isMatch = router.stack.find(
        s =>
          s.route && s.route.path == route.path && s.route.methods[route.method]
      );
      expect(isMatch).toBeTruthy();
    });
  });
});
