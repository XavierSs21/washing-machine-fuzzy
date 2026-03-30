import { useState, useEffect } from 'react'
import { getCycles } from '../services/simulation'

export const useCycles = () => {
  const [cycles, setCycles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getCycles()
      .then(setCycles)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { cycles, loading, error }
}
