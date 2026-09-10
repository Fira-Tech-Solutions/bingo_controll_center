import { useQuery } from '@tanstack/react-query'
import { api } from '../api'

const STALE_TIME = 30 * 1000
const GC_TIME = 5 * 60 * 1000

export function useCenters(token, createdBy) {
  return useQuery({
    queryKey: ['centers', createdBy || 'all'],
    queryFn: () => api.getCenters(token, createdBy).then((r) => r.data),
    enabled: !!token,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })
}

export function useTransactions(token, debitedBy) {
  return useQuery({
    queryKey: ['transactions', debitedBy || 'all'],
    queryFn: () => api.getTransactions(token, debitedBy).then((r) => r.data),
    enabled: !!token,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })
}

export function useOperators(token) {
  return useQuery({
    queryKey: ['operators'],
    queryFn: () => api.getOperators(token).then((r) => r.data),
    enabled: !!token,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })
}

export function useAdmins(token) {
  return useQuery({
    queryKey: ['admins'],
    queryFn: () => api.getAdmins(token).then((r) => r.data),
    enabled: !!token,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })
}

export function usePackages(token, page = 1, limit = 100) {
  return useQuery({
    queryKey: ['packages', page, limit],
    queryFn: () => api.getPackages(token, page, limit).then((r) => r.data),
    enabled: !!token,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })
}

export function useActivePackages(token) {
  return useQuery({
    queryKey: ['packages', 'active'],
    queryFn: () => api.getActivePackages(token).then((r) => r.data),
    enabled: !!token,
    staleTime: 60 * 1000,
    gcTime: GC_TIME,
  })
}

export function useAnalytics(token) {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.getAnalytics(token),
    enabled: !!token,
    staleTime: 60 * 1000,
    gcTime: GC_TIME,
  })
}

export function useProfile(token) {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => api.getProfile(token).then((r) => r.data),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
