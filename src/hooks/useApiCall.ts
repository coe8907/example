import {useCallback, useMemo} from 'react'
import {useSet} from 'react-use'

import type {Api, ApiResponse} from '../types'
import useInterval from './useInterval'

export type CanaryConfig = {
  apis: Api[]
  interval?: number
  onError?: (api: ApiResponse) => void
}

export type CanaryReturn = {
  apisWithErrors: Api[]
  pageHasError: boolean
}

export const useApiCall = ({
  apis,
  interval = 30000,
  onError,
}: CanaryConfig): CanaryReturn => {
  const [apisWithErrors, {add, has, remove}] = useSet<Api>(new Set())

  const fetchData = useCallback(async () => {
    apis.forEach(api => {
      makeCall(api).then(response => {
        if (response.ok && has(api)) {
          remove(api)
        } else if (!response.ok && !has(api)) {
          add(api)
          onError?.({api, response})
        }
      })
    })
  }, [apis, onError, add, has, remove])

  useInterval(fetchData, interval)

  return useMemo(
    () => ({
      pageHasError: apisWithErrors.size > 0,
      apisWithErrors: Array.from(apisWithErrors),
    }),
    [apisWithErrors]
  )
}

const makeCall = async (api: Api) => {
  return fetch(api.endpoint)
}

export default useApiCall