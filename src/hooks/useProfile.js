// src/hooks/useProfile.js
import { useState, useEffect } from 'react'
import { profileService }       from '../services/profileService'

export function useProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    profileService
      .getProfile()
      .then(data => setProfile(data))
      .catch(err  => setError(err))
      .finally(()=> setLoading(false))
  }, [])

  return { profile, loading, error }
}
