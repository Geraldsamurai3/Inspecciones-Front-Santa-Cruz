// src/hooks/useProfile.js
import { useState, useEffect } from 'react'
import { usersService } from '../services/usersService'

export function useProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    usersService.getProfile()
      .then(data => setProfile(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false))
  }, [])

  return { profile, loading, error }
}
