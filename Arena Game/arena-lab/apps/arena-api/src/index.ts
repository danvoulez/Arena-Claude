/**
 * Arena API - Cloudflare Workers Entry Point
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import battle from './routes/battle'
import training from './routes/training'
import evolution from './routes/evolution'
import creatures from './routes/creatures'
import ascension from './routes/ascension'
import state from './routes/state'

const app = new Hono()

// Global CORS
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://arenalab.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.route('/api/arena/battle', battle)
app.route('/api/arena', training)
app.route('/api/arena', evolution)
app.route('/api/arena', creatures)
app.route('/api/arena', ascension)
app.route('/api/arena', state)

// 404
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('Error:', err)
  return c.json({ 
    error: 'Internal server error',
    message: err.message 
  }, 500)
})

export default app

