"use client"

import axios from "axios"
import { toast } from "sonner"
import Cookies from "js-cookie"

export const authHeader_Bearer = () => {
  if (typeof window === "undefined") return {}

  // Get token from cookies
  const tokenFromCookies = Cookies.get("token")
  // Fallback to URL params or localStorage if needed
  const url = new URL(window.location.href)
  const tokenFromUrl = url.searchParams.get("token")
  const tokenFromLocalStorage = localStorage.getItem("token")

  const accessToken = tokenFromCookies || tokenFromUrl || tokenFromLocalStorage
  const lang = localStorage.getItem("lang")

  if (accessToken) {
    return { Authorization: "Bearer " + accessToken, lang }
  } else {
    return {}
  }
}

export const instance = axios.create({
  // Use a hardcoded URL if environment variable is not available
  // baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  headers: {
    Accept: "application/json",
  },
})

instance.interceptors.request.use(
  async (config) => {
    const authHeader = authHeader_Bearer()
    // @ts-expect-error Headers type issue
    config.headers = {
      ...config.headers,
      ...authHeader,
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ✅ Keep response interceptor for handling errors
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 403) {
      localStorage.removeItem("accessToken")
      Cookies.remove("token")
      window.location.href = "/"
    }

    if (error?.response?.status === 401) {
      // const refreshToken = Cookies.get(ECookiesKey.REFRESH_TOKEN);
      // if (!refreshToken) {
      //   Cookies.remove(ECookiesKey.ACCESS_TOKEN);
      //   window.location.href = "/";
      // } else {
      //   try {
      //     const res = await authServices.refreshToken({ refreshToken });
      //     const accessToken = get(res, "data.accessToken", "");
      //     const newRefreshToken = get(res, "data.refreshToken", "");
      //     Cookies.set(ECookiesKey.ACCESS_TOKEN, accessToken);
      //     Cookies.set(ECookiesKey.REFRESH_TOKEN, newRefreshToken);
      //   } catch (e) {
      //     Cookies.remove(ECookiesKey.REFRESH_TOKEN);
      //     Cookies.remove(ECookiesKey.ACCESS_TOKEN);
      //     window.location.href = "/";
      //   }
      // }
    }

    if (error.response) {
      toast.error(error?.response?.data?.message)
      return Promise.reject({
        status: error.response.status,
        message: error.response.data.message,
      })
    } else if (error.request) {
      return Promise.reject(error.request)
    } else {
      return Promise.reject(error)
    }
  }
)

export const flashXApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_FLASHX_API_URL || "http://localhost:3000/api/flashx",
  headers: {
    Accept: "application/json",
  },
})

export const marketApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_MARKET || "http://localhost:3000/api/market",
  headers: {
    Accept: "application/json",
  },
})
