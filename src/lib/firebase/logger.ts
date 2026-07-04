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
    console.log(`[FIRESTORE SUCCESS] ${details.operation} on ${details.collection} (${duration}ms). Path: ${details.path || 'N/A'}, Query: ${details.queryConstraints || 'N/A'}, AuthUID: ${authenticatedUid}`)

    return result
  } catch (error) {
    const duration = Date.now() - startTime
    const errMessage = error instanceof Error ? error.stack || error.message : 'Unknown error'

    // Log error details
    console.error(`[FIRESTORE FAILURE] ${details.operation} on ${details.collection} failed after ${duration}ms. Error: ${errMessage}. Path: ${details.path || 'N/A'}, Query: ${details.queryConstraints || 'N/A'}, AuthUID: ${authenticatedUid}`)

    throw error
  }
}
