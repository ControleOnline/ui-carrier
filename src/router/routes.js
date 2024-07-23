
export const routes = [   
    {
        path: '/carrier/',
        component: () =>  import ('@controleonline/quasar-layout-ui/src/layouts/AdminLayout.vue'),
        children: [
          {
            name: 'CarriersIndex',
            path: '',
            component: () =>  import ('../pages/Carrier/Index.vue')
          },
          {
            name: 'CarriersDetails',
            path: 'id/:id',
            component: () =>  import ('../pages/Carrier/Details.vue')
          },
          {
            name: 'CarrierRegionDetails',
            path: 'id/:id/region/:regionId',
            component: () =>  import ('../pages/Carrier/Region.vue')
          },
          {
            name: 'CarrierTableDetails',
            path: 'id/:id/table/:tableId',
            component: () =>  import ('../pages/Carrier/Table.vue')
          },
        ]
      },
];
