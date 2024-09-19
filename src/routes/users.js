import express from 'express'
import jwt from 'jsonwebtoken'
import Connection from '../sqlConnection.js'

const router = express.Router()

const isLoginPasswordInvalid = (str) =>
  (/[^a-z0-9_.@]/i).test(str)

router.post('/register', async (req, res) => {
  try {
    const { password, username } = req.body
    if (!password || !username) {
      return res.status(400).json({
        message: 'No username or password'
      })
    }

    if (password.length < 3 || isLoginPasswordInvalid(password)) {
      return res.status(400).json({
        message: 'Password must be at least 3 characters long, letters, numbers or symbols _ . @'
      })
    }

    if (username.length < 3 || isLoginPasswordInvalid(username)) {
      return res.status(400).json({
        message: 'Username must be at least 3 characters long, letters, numbers or symbols _ . @'
      })
    }

    Connection.query('SELECT * FROM users', async function (err, result) {
      if (err) throw err
      const foundUser = result.find(user => user.username === username)

      if (foundUser) {
        res.status(403).json({
          message: 'User exists'
        })
      } else {
        try {
          await Connection.promise().query(
            `INSERT INTO users (username, password) 
          VALUES (?,?)`,
            [username, password]
          )
          res.status(201).json({
            message: 'User Created',
          })
        } catch (err) {
          console.error(err)
          res.status(500).json({
            message: err,
          })
        }
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: err,
    })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { password, username } = req.body
    if (!password || !username) {
      return res.status(400).json({
        message: 'No username or password'
      })
    }

    if (password.length < 3 || isLoginPasswordInvalid(password)) {
      return res.status(400).json({
        message: 'Password must be at least 3 characters long, letters, numbers or symbols _ . @'
      })
    }

    if (username.length < 3 || isLoginPasswordInvalid(username)) {
      return res.status(400).json({
        message: 'Username must be at least 3 characters long, letters, numbers or symbols _ . @'
      })
    }

    Connection.query('SELECT * FROM users', async function (err, result) {
      if (err) throw err
      const foundUser = result.find(user => user.username === username)

      if (foundUser) {
        if (foundUser.password !== password) {
          return res.status(400).json({
            message: 'Incorrect password'
          })
        }

        const JWTToken = jwt.sign(
          {
            username: foundUser.username,
            id: foundUser.id
          },
          process.env.APP_SECRET,
          {
            expiresIn: '3h'
          }
        )

        res.status(200).json({
          token: JWTToken,
          user: foundUser
        })
      } else {
        res.status(404).json({
          message: 'User not found'
        })
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: err,
    })
  }
})

router.get('/user', async (req, res) => {
  try {
    const { username, id } = req.user
    res.status(200).json({
      username,
      id,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: err,
    })
  }
})

export default router
