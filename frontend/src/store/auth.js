import { defineStore } from 'pinia'
import authService from '@/services/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false
  }),

  getters: {
    isAdmin: (state) => state.user?.isAdmin || false,
    fullName: (state) => {
      if (!state.user) return ''
      return `${state.user.firstName} ${state.user.lastName}`
    }
  },

  actions: {
    async login(email, password) {
      this.loading = true
      try {
        const data = await authService.login(email, password)
        this.user = data.user
        this.token = data.token
        this.isAuthenticated = true
        return data
      } catch (error) {
        this.logout()
        throw error
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      this.loading = true
      try {
        const data = await authService.register(userData)
        this.user = data.user
        this.token = data.token
        this.isAuthenticated = true
        return data
      } catch (error) {
        this.logout()
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateProfile(userData) {
      try {
        const data = await authService.updateProfile(userData)
        this.user = data.user
        return data
      } catch (error) {
        throw error
      }
    },

    async changePassword(currentPassword, newPassword) {
      try {
        return await authService.changePassword(currentPassword, newPassword)
      } catch (error) {
        throw error
      }
    },

    logout() {
      authService.logout()
      this.user = null
      this.token = null
      this.isAuthenticated = false
    },

    initializeAuth() {
      const token = localStorage.getItem('auth_token')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        this.token = token
        this.user = JSON.parse(user)
        this.isAuthenticated = true
      }
    },

    async refreshProfile() {
      if (!this.isAuthenticated) return
      
      try {
        this.user = await authService.getProfile()
        localStorage.setItem('user', JSON.stringify(this.user))
      } catch (error) {
        this.logout()
        throw error
      }
    }
  }
})