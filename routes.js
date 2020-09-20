const nextRoutes = require('next-routes');
const routes = (module.exports = nextRoutes());


routes.add('menu-selection', '/menu-selection/:order:date', 'menu-selection')
routes.add('menu-confirmation', '/menu-confirmation/:order')



module.exports = router;