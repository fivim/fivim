import { defineConfig } from 'vitepress'

export default defineConfig({
  // app level config options
  base: '/enassi/',
  // rewrites: {
  //   '/': '/en/'
  // },
  lang: 'en-US',
  title: 'enassi',
  description: 'Enassi is your data encryption assistant.',

  themeConfig: {
    logo: '/images/logo.png',
    // nav: [
    //   { text: 'Github', link: 'https://github.com/enassi/enassi' },
    // ],
    sidebar: [
      {
        text: 'User guide',
        items: [
          { text: 'Getting started', link: '/en/user_guide/getting_started' },
          { text: 'Themes', link: '/en/user_guide/themes' },
          { text: 'FAQ', link: '/en/faq' },
        ]
      },
      {
        text: 'Develop',
        items: [
          { text: 'Overview', link: '/en/develop/overview' },
          { text: 'File format', link: '/en/develop/file_format' },
          { text: 'User data struct', link: '/en/develop/user_data_struct' },
          { text: 'Git', link: '/en/develop/git' }
        ]
      }
    ],
    footer: {
      // message: '###',
      copyright: 'Copyright © 2023 enassi'
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/enassi/enassi" }
    ]
  },

  // Refer: https://vitepress.dev/guide/i18n
  locales: {
    root: {
      label: 'English',
      lang: 'en'
    },
    // fr: {
    //   label: 'French',
    //   lang: 'fr', // optional, will be added  as `lang` attribute on `html` tag
    //   link: '/fr/guide' // default /fr/ -- shows on navbar translations menu, can be external

    //   // other locale specific properties...
    // }
  },

})
