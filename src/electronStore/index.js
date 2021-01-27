import ElectronStore from 'electron-store'

export const globalStore = new ElectronStore()

// if (!global.globalStore) {
//   global.globalStore = globalStore
//   console.log(global)
// }


export function getSysLanguage(app) {

  let language = globalStore.get('sysLanguage')
  if (!language) {
    language = app.getLocale().toLowerCase()
    const locals = ['zh', 'en']
    for (const local of locals) {
      if (language.indexOf(local) !== -1) {
        globalStore.set('sysLanguage', local)
        console.log('local', local)
        return local
      }

    }
  }

  return language || 'en'
}

class RoomHistory {
  constructor() {
    this._historys = globalStore.get('RoomHistorys') || []
  }
  get(name) {
    return this._historys.find(his => his.code === name)
  }

  set(val) {
    const hasIdx = this._historys.findIndex(his => his.code === val.code)
    if (hasIdx === -1 && this._historys.length < 20) {
      this._historys.push(val)
    } else if (hasIdx === -1) {
      this._historys.shift()
      this._historys.push(val)
    } else {
      this._historys.splice(hasIdx, 1, val)
    }
    globalStore.set('RoomHistorys', this._historys)
  }

  getToken(name) {
    if (!(name in this._historys)) return null
    const his = this._historys.find(his => his.code === name)
    return his.token
  }


  clear() {
    globalStore.delete('RoomHistorys')
  }
}

export const roomHistory = new RoomHistory()

