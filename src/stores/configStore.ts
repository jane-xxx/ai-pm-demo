import { reactive } from 'vue'
import { AgentConfig } from '@/types'
import { storageService } from '@/services/storageService'
import { agentService } from '@/services/agentService'

class ConfigStore {
  private state = reactive({
    config: storageService.getConfig(),
  })

  get config() {
    return this.state.config
  }

  updateConfig(config: Partial<AgentConfig>): void {
    this.state.config = { ...this.state.config, ...config }
    storageService.saveConfig(this.state.config)
    agentService.setConfig(this.state.config)
  }
}

export const configStore = new ConfigStore()
