import express from 'express'
import Connection from '../sqlConnection.js'

const router = express.Router()

router.get('/transactions', async (_, res) => {
  try {
    Connection.query('SELECT * FROM transactions', async function (err, result) {
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

router.post('/transactions', async (req, res) => {
  const { memo, initiator, recipient, amount } = req.body

  if (!initiator || !recipient || !amount) return res.status(400).json({
    message: '[amount, initiator, recipient] fields must not be empty',
  })

  if (parseFloat(amount) < 0) return res.status(400).json({
    message: 'amount must be more or equal 0',
  })

  try {
    Connection.query('SELECT * FROM accounts', async function (err, result) {
      if (err) throw err

      const initiatorAccount = result.find(item => item.name === initiator)
      const recipientAccount = result.find(item => item.name === recipient)

      if (!initiatorAccount) return res.status(400).json({
        message: 'initiator must be existing bank client',
      })

      if (parseFloat(initiatorAccount.value) < parseFloat(amount)) return res.status(400).json({
        message: 'insufficient funds',
      })

      try {
        await Connection.promise().query(
          'UPDATE accounts SET ? WHERE ?',
          [{ value: parseFloat(initiatorAccount.value) - parseFloat(amount) }, { id: initiatorAccount.id }]
        )
        console.log(`initiator account [${initiator}] updated`)
      } catch (e) {
        console.error(e)
        res.status(500).json({
          message: e,
        })
      }

      if (recipientAccount) {
        try {
          await Connection.promise().query(
            'UPDATE accounts SET ? WHERE ?',
            [{ value: parseFloat(recipientAccount.value) + parseFloat(amount) }, { id: recipientAccount.id }]
          )
          console.log(`recipient account [${recipient}] updated`)
        } catch (e) {
          console.error(e)
          res.status(500).json({
            message: e,
          })
        }
      }

      try {
        await Connection.promise().query(
          `INSERT INTO transactions (initiator_account, recipient_account, memo, amount) VALUES (?,?,?,?)`,
          [initiator, recipient, memo, parseFloat(amount)]
        )
      } catch (e) {
        console.error(e)
        res.status(500).json({
          message: e,
        })
      }

      res.status(201).json({
        message: 'transaction created',
      })
    })

  } catch (e) {
    console.error(e)
    res.status(500).json({
      message: e,
    })
  }
})

export default router
