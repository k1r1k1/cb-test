import express from 'express'
import Connection from '../sqlConnection.js'

const router = express.Router()

router.get('/info', async (_, res) => {
  try {
    Connection.query('SELECT * FROM info', async function (err, result) {
      if (err) throw err
      res.status(200).json(result)
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({
      message: e,
    })
  }
})

router.post('/info', async (req, res) => {
  const { description, data, name } = req.body
  if (!name || !data) return res.status(400).json({
      message: 'name and data must not be empty',
    })
  try {

    Connection.query('SELECT * FROM info', async function (err, result) {
      if (err) throw err

      const foundItem = result.find(item => item.name === name)
      if (foundItem) {
        res.status(400).json({
          message: 'name must be unique',
        })
      } else {
        await Connection.promise().query(
          `INSERT INTO info (name, description, data) VALUES (?,?,?)`,
          [name, description, data]
        )
        res.status(201).json({
          message: 'item created',
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

router.put('/info', async (req, res) => {
  const { id, description, data, name } = req.body

  if (!name || !data || !id) return res.status(400).json({
      message: 'id, name and data must not be empty',
    })

  try {
    await Connection.promise().query(
      'UPDATE info SET ? WHERE ?',
      [{ data, description, name }, { id }]
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

router.delete('/info/:id', async (req, res) => {
  try {
    const { id } = req.params
    if (!id || typeof id !== 'number') {
      res.status(400).json({
        message: 'id must be number'
      })
      return
    }
    await Connection.promise().query(
      `DELETE FROM info where id = ?`,
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
