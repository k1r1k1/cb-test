import express from 'express'
import Connection from '../sqlConnection.js'
import { getSqlDate } from '../helpers/date.js'

const router = express.Router()

router.get('/clients/:id?', async (req, res) => {
  const { id } = req.params
  try {
    if (id) {
      console.log(id)
      Connection.query('SELECT * FROM clients WHERE id = ?', [id], async function (err, result) {
        if (err) throw err
        res.status(200).json(result)
      })
    } else {
      Connection.query('SELECT * FROM clients', async function (err, result) {
        if (err) throw err
        res.status(200).json(result)
      })
    }
  } catch (e) {
    console.error(e)
    res.status(500).json({
      message: e,
    })
  }
})

router.post('/clients', async (req, res) => {
  const { passport, name, lastName, middleName, birthDate } = req.body
  if (!name || !lastName || !middleName || !birthDate || !passport) return res.status(400).json({
    message: '[passport, name, lastName, middleName, birthDate] fields must not be empty',
  })
  try {

    Connection.query('SELECT * FROM clients', async function (err, result) {
      if (err) throw err

      const foundItem = result.find(item => item.passport === passport)
      if (foundItem) {
        res.status(400).json({
          message: 'passport must be unique',
        })
      } else {
        const regDate = getSqlDate(Date.now())
        await Connection.promise().query(
          `INSERT INTO clients (first_name, middle_name, last_name, passport, reg_date, birth_date) VALUES (?,?,?,?,?,?)`,
          [name, middleName, lastName, passport, regDate, getSqlDate(birthDate)]
        )
        res.status(201).json({
          message: 'client created',
        })
      }
    })

  } catch (e) {
    console.error(e)
    res.status(500).json({
      message: e,
    })
  }
})

router.put('/clients', async (req, res) => {
  const { id, passport, name, lastName, middleName, birthDate } = req.body

  if (!name || !lastName || !middleName || !birthDate || !passport || !id) return res.status(400).json({
    message: '[id, passport, name, lastName, middleName, birthDate] fields must not be empty',
  })

  try {
    await Connection.promise().query(
      'UPDATE clients SET ? WHERE ?',
      [{ first_name: name, middle_name: middleName, last_name: lastName, passport, birth_date: getSqlDate(birthDate) }, { id }]
    )
    res.status(200).json({
      message: 'item updated',
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({
      message: e,
    })
  }
})

router.delete('/clients/:id', async (req, res) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({
        message: 'id must be number'
      })
    }
    await Connection.promise().query(
      `DELETE FROM clients where id = ?`,
      [id]
    )
    res.status(204).json({
      message: 'deleted',
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: err,
    })
  }
})

export default router
