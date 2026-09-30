import { Center, Loader } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { Navigate, Route, Routes } from 'react-router'
import { api } from './api'
import AdminLayout from './pages/AdminLayout'
import BottlesPage from './pages/BottlesPage'
import CocktailsPage from './pages/CocktailsPage'
import LoginPage from './pages/LoginPage'
import MenuPage from './pages/MenuPage'
import MixersPage from './pages/MixersPage'
import RegisterPage from './pages/RegisterPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MenuPage />} />
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

/** Everything under /admin; only here do we ask who is logged in. */
function AdminApp() {
  const me = useQuery({ queryKey: ['me'], queryFn: api.me })

  if (me.isPending) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    )
  }

  if (!me.data) {
    return (
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<AdminLayout name={me.data.name} />}>
        <Route path="bottles" element={<BottlesPage />} />
        <Route path="mixers" element={<MixersPage />} />
        <Route path="cocktails" element={<CocktailsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin/bottles" replace />} />
    </Routes>
  )
}
