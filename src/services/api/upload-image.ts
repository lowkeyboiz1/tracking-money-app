import { instance } from './instance'

export const uploadImageServices = {
  uploadImage: async (data: FormData, onProgress?: (progress: number, loaded: number, total: number) => void, signal?: AbortSignal) => {
    if (onProgress) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        // Setup progress tracking
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100)
            onProgress(percentComplete, event.loaded, event.total)
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText)
              resolve(response)
            } catch (e) {
              reject(new Error('Invalid response format'))
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        })

        xhr.addEventListener('error', () => reject(new Error('Network error during upload')))
        xhr.addEventListener('abort', () => reject(new Error('Upload aborted')))

        // Set up the request
        xhr.open('POST', `${instance.defaults.baseURL}/api/upload/upload-image`)

        // Set headers from instance if available
        const token = localStorage.getItem('token')
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        }

        // Send the request
        xhr.send(data)

        // Setup abort handler
        if (signal) {
          signal.addEventListener('abort', () => xhr.abort())
        }
      })
    } else {
      // Fallback to instance when no progress tracking needed
      const response = await instance.post(`/api/upload/upload-image`, data)
      return response.data
    }
  }
}
