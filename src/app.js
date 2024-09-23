import express from 'express'
import bodyParser from 'body-parser'
import jwt from 'jsonwebtoken'
import cors from 'cors'

import usersRoutes from './routes/users.js'
import infoRoutes from './routes/bankInfo.js'
import clientsRoutes from './routes/clients.js'
import accountsRoutes from './routes/accounts.js'
import transactionsRoutes from './routes/transactions.js'

// config

const App = express()
App.use(bodyParser.urlencoded({ extended: false }))
App.use(bodyParser.json())
App.use(cors())

// check auth

App.use((req, res, next) => {
  if (req.url === '/login' || req.url === '/register') return next()
  if (!req.headers?.authorization) {
    return res.status(401).json({
      message: 'unauthorized'
    })
  } else {
    jwt.verify(
      req.headers.authorization.split(' ')[1],
      process.env.APP_SECRET,
      (err, payload) => {
        if (err) {
          return res.status(401).json({
            message: err.message
          })
        }
        if (payload) {
          req.user = payload
          next()
        }
      }
    )
  }
})

// routes

App.get('/healthcheck', function (req, res) {
  res.json({
    status: 'running'
  });
});

App.use(usersRoutes)
App.use(infoRoutes)
App.use(clientsRoutes)
App.use(accountsRoutes)
App.use(transactionsRoutes)

App.listen(8081, () => {
  console.log('server listening on: 8081')
})
