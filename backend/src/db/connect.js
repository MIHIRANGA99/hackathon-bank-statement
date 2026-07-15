import mongoose from 'mongoose'

let connected = false

export async function connectDB() {
  if (connected) return mongoose.connection

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set — check backend/.env')
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB_NAME || 'statement_analyser',
  })
  connected = true
  console.log(`[MongoDB] Connected to database "${mongoose.connection.name}"`)
  return mongoose.connection
}
