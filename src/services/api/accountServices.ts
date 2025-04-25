import { instance } from '@/services/api/instance'

export const accountServices = {
  requestOtp: async ({ phone_number, device_id }: { phone_number: string; device_id: string }) => await instance.post('/api/auth/request-otp', { phone_number, device_id }),
  getLocation: async ({ latlng }: { latlng?: string }) => {
    const url = latlng ? `/api/onboarding/provinces?latlng=${latlng}` : '/api/onboarding/provinces'
    return await instance.get(url)
  },
  getRecommendedCrops: async ({ province }: { province: string }) => {
    return await instance.get(`/api/onboarding/recommended-crops?province=${encodeURIComponent(province)}`)
  },
  completeOnboarding: async (userData: { location: string; crops: string[]; name?: string; age?: number; goal?: string }) => {
    return await instance.post('/api/onboarding/complete', userData)
  }
}
