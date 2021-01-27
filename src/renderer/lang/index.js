import Vue from 'vue'
import VueI18n from 'vue-i18n'
import elementEnLang from 'element-ui/lib/locale/lang/en' // element-ui lang
import elementZhLang from 'element-ui/lib/locale/lang/zh-CN'// element-ui lang
import ElementLocale from 'element-ui/lib/locale'
import enLang from './en'
import zhLang from './zh'
import { globalStore } from '@/../electronStore'

Vue.prototype.globalStore = globalStore
Vue.use(VueI18n)

const messages = {
  en: {
    ...enLang,
    ...elementEnLang
  },
  zh: {
    ...zhLang,
    ...elementZhLang
  }
}
export function getLanguage() {
  let language = globalStore.get('sysLanguage')

  console.log('getlanguage', language)
  globalStore.set('sysLanguage', '')

  if (language) return language

  // 修改浏览器语言，不一定会改变 navigator.language
  language = (navigator.language || navigator.browserLanguage).toLowerCase()
  const locales = Object.keys(messages)
  for (const locale of locales) {
    if (language.indexOf(locale) > -1) {
      return locale
    }
  }

  return 'en'
}

const i18n = new VueI18n({
  locale: getLanguage(),
  messages
})

ElementLocale.i18n((key, value) => i18n.t(key, value))
export default i18n