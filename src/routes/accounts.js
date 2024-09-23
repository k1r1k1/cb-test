import express from 'express'
import Connection from '../sqlConnection.js'

const router = express.Router()

router.get('/accounts/:name?', async (req, res) => {
  const { name } = req.params
  try {
    if (name) {
      Connection.query('SELECT * FROM accounts WHERE name = ?', [name], async function (err, result) {
        if (err) throw err
        res.status(200).json(result)
      })
    } else {
      Connection.query('SELECT * FROM accounts', async function (err, result) {
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

router.post('/accounts', async (req, res) => {
  const { clientId, name, value } = req.body
  if (!name || !clientId) {
    return res.status(400).json({
      message: '[name, clientId] fields must not be empty',
    })
  } else {
    if (parseFloat(value) < 0) return res.status(400).json({
      message: 'value must be more or equal 0',
    })
  }

  try {

    Connection.query('SELECT * FROM accounts', async function (err, result) {
      if (err) throw err

      const foundItem = result.find(item => item.name === name)
      if (foundItem) {
        res.status(400).json({
          message: 'name must be unique',
        })
      } else {
        await Connection.promise().query(
          `INSERT INTO accounts (client_id, name, value) VALUES (?,?,?)`,
          [clientId, name, parseFloat(value)]
        )
        res.status(201).json({
          message: 'account created',
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

router.put('/accounts', async (req, res) => {
  const { value, id } = req.body
  console.log(req.body)

  if (!id) {
    return res.status(400).json({
      message: '[id] must not be empty',
    })
  } else {
    if (parseFloat(value) < 0) return res.status(400).json({
      message: 'value must be more or equal 0',
    })
  }

  try {
    await Connection.promise().query(
      'UPDATE accounts SET ? WHERE ?',
      [{ value: parseFloat(value) }, { id }]
    )
    res.status(200).json({
      message: 'account updated',
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({
      message: e,
    })
  }
})

router.delete('/accounts/:id', async (req, res) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({
        message: 'id must be number'
      })
    }
    await Connection.promise().query(
      `DELETE FROM accounts where id = ?`,
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
