'use client'

import { useEffect } from 'react'

export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Loop PWA ServiceWorker registered with scope: ', registration.scope)
          })
          .catch((err) => {
            console.error('Loop PWA ServiceWorker registration failed: ', err)
          })
      })
    }
  }, [])

  return null
}
