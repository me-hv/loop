import { firebaseAuth } from './client'

interface LogDetails {
  operation: 'getDoc' | 'getDocs' | 'addDoc' | 'setDoc' | 'updateDoc' | 'deleteDoc' | 'writeBatch' | 'runTransaction'
  collection: string
  path?: string
  queryConstraints?: string
  payload?: unknown
}

export async function runWithFirestoreLogger<T>(
  details: LogDetails,
  operationFn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now()
  const authenticatedUid = firebaseAuth?.currentUser?.uid || 'Not Authenticated'

  try {
    const result = await operationFn()
    const duration = Date.now() - startTime

    // Log success details
    console.log(`[FIRESTORE SUCCESS]`, {
      operation: details.operation,
      collection: details.collection,
      path: details.path || null,
      queryConstraints: details.queryConstraints || null,
      authenticatedUid,
      payload: details.payload || null,
      durationMs: duration,
      status: 'success'
    })

    return result
  } catch (error) {
    const duration = Date.now() - startTime
    const errMessage = error instanceof Error ? error.message : 'Unknown error'

    // Log error details
    console.error(`[FIRESTORE FAILURE]`, {
      operation: details.operation,
      collection: details.collection,
      path: details.path || null,
      queryConstraints: details.queryConstraints || null,
      authenticatedUid,
      payload: details.payload || null,
      durationMs: duration,
      error: errMessage,
      status: 'failure'
    })

    throw error
  }
}
