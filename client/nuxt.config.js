export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'VRMChat',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [{
        charset: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        hid: 'description',
        name: 'description',
        content: '',
      },
    ],
    link: [{
      rel: 'icon',
      type: 'image/x-icon',
      href: '/favicon.ico',
    }, ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [],

  // serverMiddleware: ['~/api'],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: ['@nuxtjs/axios', '@nuxtjs/proxy', '@nuxtjs/style-resources'],

  env: {
    baseUrl: process.env.BASE_URL || 'http://localhost:8000',
  },

  axios: {
    proxy: true
  },
  proxy: {
    '/upload': 'http://localhost:8000'
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    cssSourceMap: false,
    extend(config) {
      config.node = {
        fs: 'empty',
        net: 'empty',
      }
    },
    transpile: ['three'],
    babel: {
      babelrc: false,
      compact: false,
    },
  },

  generate: {
    dir: 'dist',
  },

  server: {
    port: 3000,
    host: '0.0.0.0',
    timing: false,
  },
}
