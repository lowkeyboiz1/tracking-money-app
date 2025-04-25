import { instance } from '@/services/api/instance'

export const apiServices = {
  login: async ({ queryString }: { queryString: string }) =>
    await instance.post(`/users/authenticateTerminal`, {
      queryString
    }),
  getUserInfo: async () => await instance.get('/users/getInfo'),
  refreshToken: async ({ refreshToken }: { refreshToken: string }) => await instance.post('https://localhost:5000/users/refreshToken', { refreshToken }),
  requestOtp: async ({ phone_number, device_id }: { phone_number: string; device_id: string }) => await instance.post('/api/auth/request-otp', { phone_number, device_id })
}
