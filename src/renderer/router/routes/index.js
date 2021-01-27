const publicRoutes = [
  {
    path: '/',
    component: require('@/layouts/default.vue').default,
    redirect: '/join-meet',
    children: [
      {
        path: '/landing-page',
        name: 'landing-page',
        component: require('@/components/LandingPage').default
      },
      {
        path: '/test',
        name: 'testdemo',
        component: require('@/views/test').default
      },

      {
        path: '/join-meet',
        name: 'join-meet',
        component: require('@/views/joinMeeting/index.vue').default
      },
      {
        path: '/showMeeting',
        name: 'showMeeting',
        component: require('@/views/joinMeeting/showMeeting.vue').default
      },
    ]
  },

  {
    path: '*',
    redirect: '/'
  }
]
const userRoutes = []

module.exports = {
  publicRoutes,
  userRoutes
}