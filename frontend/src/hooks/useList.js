import { useEffect, useState } from 'react'
import api, { errMsg } from '../services/api'

export default function useList(path, params = {}) {
  const [state, setState] = useState({ data: [], total: 0, loading: true, error: '' })
  const [tick, setTick] = useState(0)
  const key = JSON.stringify(params)

  useEffect(() => {
    let cancelled = false
    api.get(path, { params: JSON.parse(key) })
      .then((r) => !cancelled && setState({ data: r.data.data, total: r.data.total, loading: false, error: '' }))
      .catch((e) => !cancelled && setState((s) => ({ ...s, loading: false, error: errMsg(e) })))
    return () => { cancelled = true }
  }, [path, key, tick])

  return { ...state, reload: () => setTick((t) => t + 1) }
}
