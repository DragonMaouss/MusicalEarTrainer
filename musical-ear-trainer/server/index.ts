import express from 'express'
import cors from 'cors'
import analysisRoutes from './routes/analysisRoutes'

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

app.use('/api/analysis', analysisRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(port, () => {
  console.log(`API disponible sur http://localhost:${port}`)
})