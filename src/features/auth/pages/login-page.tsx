import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas'
import { useAuthStore } from '@/shared/stores/auth-store'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true)
    try {
      await login(values)
      navigate('/', { replace: true })
    } catch {
      toast.error('Correo electrónico o contraseña incorrectos')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
      <div
        className="w-full max-w-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500 motion-safe:ease-out"
      >
        <Card className="overflow-hidden shadow-lg">
          {/* Brand accent strip at top */}
          <div className="h-1.5 w-full bg-primary" aria-hidden="true" />

          <CardHeader className="pb-4 pt-6 text-center">
            <div className="mb-3 flex justify-center">
              {/* Logo mark */}
              <div
                className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20"
                aria-hidden="true"
              >
                <span className="text-xl font-bold text-primary">L</span>
              </div>
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
              LCP Inventario
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Inicia sesión para continuar
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-6">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <FieldGroup>
                <Field data-invalid={!!errors.username}>
                  <FieldLabel htmlFor="username">Correo electrónico</FieldLabel>
                  <Input
                    id="username"
                    type="email"
                    autoComplete="email"
                    aria-required="true"
                    aria-invalid={!!errors.username}
                    aria-describedby={errors.username ? 'username-error' : undefined}
                    className="h-11"
                    {...register('username')}
                  />
                  <FieldError id="username-error" errors={[errors.username]} />
                </Field>

                <Field data-invalid={!!errors.password}>
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    aria-required="true"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    className="h-11"
                    {...register('password')}
                  />
                  <FieldError id="password-error" errors={[errors.password]} />
                </Field>

                <Button
                  type="submit"
                  className="h-11 w-full text-sm font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
