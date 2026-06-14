import { reactive } from 'vue'
import { User, DEFAULT_USER } from '@/types'
import { storageService } from '@/services/storageService'

class UserStore {
  private state = reactive({
    user: storageService.getUser() || DEFAULT_USER,
  })

  get user() {
    return this.state.user
  }

  updateUser(user: Partial<User>): void {
    this.state.user = { ...this.state.user, ...user }
    storageService.saveUser(this.state.user)
  }
}

export const userStore = new UserStore()
