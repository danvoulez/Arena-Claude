/**
 * Login Page
 * 
 * Tela de login com Google OAuth
 */

'use client'

import { useGoogleLogin } from '@react-oauth/google'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true)
      setError(null)
      
      try {
        // Salvar token no localStorage
        localStorage.setItem('google_token', tokenResponse.access_token)
        
        // Redirecionar para dashboard
        router.push('/dashboard')
      } catch (err) {
        setError('Failed to login')
        setLoading(false)
      }
    },
    onError: () => {
      setError('Login failed')
      setLoading(false)
    }
  })

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      background: 'linear-gradient(135deg, #000 0%, #1a1a1a 100%)'
    }}>
      <h1 style={{
        fontSize: '3rem',
        marginBottom: '1rem',
        background: 'linear-gradient(135deg, #fff 0%, #888 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        ArenaLab
      </h1>
      
      <p style={{
        fontSize: '1.2rem',
        color: '#888',
        marginBottom: '3rem',
        textAlign: 'center'
      }}>
        Train, battle, and evolve AI creatures
      </p>

      {error && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          background: '#ff0000',
          color: '#fff',
          borderRadius: '8px'
        }}>
          {error}
        </div>
      )}

      <button
        onClick={() => login()}
        disabled={loading}
        style={{
          padding: '1rem 2rem',
          fontSize: '1.1rem',
          background: loading ? '#444' : '#fff',
          color: loading ? '#888' : '#000',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          transition: 'all 0.2s'
        }}
      >
        {loading ? 'Loading...' : 'Sign in with Google'}
      </button>

      <p style={{
        marginTop: '2rem',
        fontSize: '0.9rem',
        color: '#666',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        By signing in, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  )
}

