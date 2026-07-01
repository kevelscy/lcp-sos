import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'

import { loginSchema, type LoginFormValues } from '@/features/auth/schemas'
import { useAuthStore } from '@/shared/stores/auth-store'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginError, setLoginError] = useState('')

  const { register, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true)
    setLoginError('')
    try {
      await login(values)
      navigate('/', { replace: true })
    } catch {
      setLoginError('Correo electrónico o contraseña incorrectos')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '32px 30px 40px',
        background: 'linear-gradient(180deg, #f5f7fa 0%, #eaeff4 100%)',
        animation: 'screenIn .4s ease',
      }}
    >
      {/* Logo + brand */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
        <div
          style={{
            width: 78,
            height: 78,
            borderRadius: 24,
            background: 'linear-gradient(160deg, #1d6299 0%, #165382 60%, #103f66 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
          aria-hidden="true"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.5 8.5 12 4l8.5 4.5-8.5 4.5z"/>
            <path d="M3.5 8.5v7L12 20l8.5-4.5v-7"/>
            <path d="M12 13v7"/>
          </svg>
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#0f2a40', letterSpacing: '-.5px' }}>
          Acopio
        </div>
        <div style={{ fontSize: 14.5, fontWeight: 500, color: '#65788a', marginTop: 5 }}>
          Inventario de donaciones · Umía
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <label
          htmlFor="username"
          style={{ fontSize: 13, fontWeight: 600, color: '#3a4d5e', marginBottom: 7, display: 'block' }}
        >
          Correo
        </label>
        <input
          id="username"
          type="email"
          autoComplete="email"
          placeholder="tucorreo@umiasalud.com"
          style={{
            width: '100%',
            background: '#fff',
            border: '1.5px solid #e2e8ef',
            borderRadius: 15,
            padding: '15px 16px',
            fontSize: 15,
            fontWeight: 500,
            color: '#12212e',
            outline: 'none',
            marginBottom: 16,
          }}
          {...register('username')}
        />

        <label
          htmlFor="password"
          style={{ fontSize: 13, fontWeight: 600, color: '#3a4d5e', marginBottom: 7, display: 'block' }}
        >
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          style={{
            width: '100%',
            background: '#fff',
            border: '1.5px solid #e2e8ef',
            borderRadius: 15,
            padding: '15px 16px',
            fontSize: 15,
            fontWeight: 500,
            color: '#12212e',
            outline: 'none',
          }}
          {...register('password')}
        />

        {loginError && (
          <div
            style={{
              color: '#c8392f',
              fontSize: 13,
              fontWeight: 600,
              marginTop: 12,
              textAlign: 'center',
            }}
            role="alert"
          >
            {loginError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            marginTop: 26,
            width: '100%',
            background: 'linear-gradient(180deg, #1d6299, #165382)',
            color: '#fff',
            border: 'none',
            borderRadius: 16,
            padding: 17,
            fontSize: 16,
            fontWeight: 700,
            cursor: isSubmitting ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 9,
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting ? 'Ingresando…' : (
            <>
              Iniciar sesión
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/>
                <path d="m13 6 6 6-6 6"/>
              </svg>
            </>
          )}
        </button>
      </form>

      <div
        style={{ textAlign: 'center', marginTop: 22, fontSize: 12.5, color: '#93a2b0', fontWeight: 500 }}
      >
        Acceso exclusivo del personal de acopio
      </div>
    </main>
  )
}
