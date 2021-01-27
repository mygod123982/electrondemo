const http = require('https')
const cheerio = require('cheerio')
const tough = require('tough-cookie')
const Cookie = tough.Cookie
/* 主函数，负责传递 url 通过 https模块去获取相关的数据 */

// const url = ' https://meet.menco.cn/r/5ffd46c49f86b'

const rule = /尚无会议/
const replaceRole = [/\\n/g, /(^\s*)|(\s*$)/g]

/**
 * 通过url 获取网页中的 token等信息
 * @param {*} url 
 */
export default async function main_getInfos(url) {
  const res = await getDate(url)
  // const res = await axios.get(url)
  const $ = cheerio.load(res.data)
  const cookie = res.cookie
  console.log(res.headers)
  const { flag: state, result } = getStatus($, $('#others-join-room'), '.col-3', '.col-9')
  console.log(result, state, 'result,state')
  if (state) return { result }
  const urlInfo = geturlInfo($, $('#others-join-room'), 'form')
  return Object.assign({ cookie, result }, urlInfo)
}


function getStatus($, $els, key, value) {
  let flag = false
  const $key = $els.find(key)
  const $value = $els.find(value)
  const result = {}
  $value.each((idx, ele) => {
    let val = $(ele).text()
    const key = $($key[idx]).text()
    replaceRole.forEach(rule => val = val.replace(rule, ''))
    result[key] = val
    if (rule.test(val)) {
      flag = true
    }
  })
  return { flag, result }
}

function geturlInfo($, $el, path) {
  const $from = $el.find(path)
  const $input = $from.find('input[name=_token]')
  const method = $from.attr('method')
  const url = $from.attr('action')
  const token = $input.attr('value')


  return {
    method,
    url,
    token
  }
  console.log('method,url,token', method, url, token)
}

function getDate(url) {
  return new Promise((resolve, reject) => {

    http.get(url, res => {
      let html = ''
      let cookie
      if (res.headers['set-cookie'] instanceof Array)
        cookie = res.headers['set-cookie'].map(Cookie.parse)
      else
        cookie = [Cookie.parse(res.headers['set-cookie'])]
      console.log(res, 'res')
      res.on('data', (data) => {
        html += data
      })
      res.on('end', () => {
        resolve({
          data: html,
          cookie
        })
      })
    })
  })
}
// main_getInfos(url)