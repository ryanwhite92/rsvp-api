import router from '../admin.router';

describe('admin router', () => {
  test('admin routes exist', () => {
    const routes = [
      { path: '/', method: 'get' },
      { path: '/:id', method: 'get' },
      { path: '/signin', method: 'post' }
      // { path: '/signup', method: 'post' }
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
