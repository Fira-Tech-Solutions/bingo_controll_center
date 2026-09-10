import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, token } = useAuth()
  const navigate = useNavigate()

  const denied = !token || !user || (requiredRole && (() => {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    return !roles.includes(user.role)
  })())

  useEffect(() => {
    if (denied) navigate('/', { replace: true })
  }, [denied, navigate])

  if (denied) return null

  return children
}
