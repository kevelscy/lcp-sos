import { RouterProvider } from 'react-router-dom'

import { router } from '@/routes'
import { Toaster } from '@/shared/components/ui/sonner'

/** Root application shell: router + global toast host. */
function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </>
  )
}

export default App
