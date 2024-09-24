import mysql from 'mysql2'
import dotenv from 'dotenv'

dotenv.config()

const config = {
  connectionLimit: 10,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}

const Connection = mysql.createPool(config)

export default Connection
