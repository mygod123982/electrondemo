
const tough = require('tough-cookie')
const Cookie = tough.Cookie
const cheerio = require('cheerio')
// const got = require('got')
const https = require('https')
const nodeFormData = require('form-data')
const url = require('url')

/**
 *  获取code and key
 * @param {*} requestInfo 
 * @param {*} users 
 */
export default async function mianCodeAndKey(requestInfo, users) {
  const { token, cookie, method, url: src } = requestInfo

  const fd = new nodeFormData()
  fd.append('_token', token)
  Object.keys(users).forEach(key => {
    fd.append(key, users[key])
  })
  const urlOBj = url.parse(src)
  const cookieStr = cookie.reduce((sum, current, idx) => {
    const str = new Cookie(current).cookieString() + ';'
    return sum += str
  }, '')
  console.log(fd)
  const options = {
    'method': method,
    'hostname': urlOBj.hostname,
    'path': urlOBj.path,
    'headers': {
      'Cookie': cookieStr,
      ...fd.getHeaders()
    },
    'maxRedirects': 20
  }
  const result = await getDate(options, fd)
  return result
}

/**
 * 获取数据
 * @param {*} options 
 * @param {*} fd 
 */
async function getDate(options, fd) {

  return new Promise((resolve, reject) => {
    const replaceRole = [/\\n/g, /(^\s*)|(\s*$)/g]
    const req = https.request(options, function (res) {
      const chunks = []

      res.on("data", function (chunk) {
        chunks.push(chunk)
      })

      res.on("end", function (chunk) {
        const body = Buffer.concat(chunks)
        const $ = cheerio.load(body.toString())
        const $code = $('.code')
        const $message = $('.message')
        console.log($code.length, $message.length)
        if ($code.length) {
          const code = replaceRole.reduce((result, current) => {
            return result.replace(current, '')
          }, $code.text())
          const message = replaceRole.reduce((result, current) => {
            return result.replace(current, '')
          }, $message.text())
          reject({
            code, message
          })
        } else {
          const contentUrl = $('title').text().split(' ').find(url => {
            return /^(((ht|f)tps?):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/.test(url)
          })
          resolve(url.parse(contentUrl, true).query)
        }
      })

      res.on("error", function (error) {
        console.error(error)
        reject(error)
      })
    })
    fd.pipe(req)

  })

}