import * as http from 'http'
import * as https from 'https'
import * as path from 'path'

const MAX_IMAGE_SIZE = 10 * 1024 * 1024

http
  .createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Request-Method', '*')
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET')
    res.setHeader('Access-Control-Allow-Headers', '*')

    if (req.method === 'OPTIONS') {
      res.writeHead(200)
      res.end()
      return
    }

    if (req.url === '/healthcheck') {
      res.writeHead(200)
      res.end()
      return
    }

    delete req.headers.authorization
    delete req.headers['x-auth-token']
    delete req.headers['x-auth-offline-token']

    /** Remove / or // prefixes */
    const target = (req.url as string).replace(/^\/+/, '')

    try {
      const url = new URL(target)

      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error('Invalid URL protocol')
      }

      if (url.hostname === '') {
        throw new Error('Invalid URL hostname')
      }

      const ext = path.extname(url.pathname)
      if (!['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
        res.writeHead(400)
        res.end('Only image files can be proxied')
        return
      }

      const library = url.protocol === 'http:' ? http : https
      library
        .get(url.href, (targetRes) => {
          const contentLength = parseInt(targetRes.headers['content-length'] as string)
          if (contentLength > MAX_IMAGE_SIZE) {
            res.writeHead(413, { 'Content-Type': 'text/plain' })
            res.end(`Image size exceeds the limit of ${MAX_IMAGE_SIZE} bytes.`)
            return
          }

          const contentType = targetRes.headers['content-type']
          if (!contentType || !contentType.startsWith('image/')) {
            res.writeHead(400, { 'Content-Type': 'text/plain' })
            res.end(`Invalid content type: ${contentType}`)
            return
          }

          res.writeHead(targetRes.statusCode as number, targetRes.headers)
          targetRes.pipe(res)
        })
        .on('error', (error) => {
          res.writeHead(500)
          res.end(`Error: ${error.message}`)
        })
    } catch (error) {
      res.writeHead(500)
      res.end(`Invalid URL: ${target} Error: ${error}`)
    }
  })
  .listen(3000)