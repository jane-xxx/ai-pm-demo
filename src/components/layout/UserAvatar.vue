<template>
  <div class="user-avatar">
    <div class="avatar-icon">{{ user.avatar }}</div>
    <div class="user-name">{{ user.name }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { userStore } from '@/stores/userStore'

const user = computed(() => userStore.user)
</script>

<style scoped>
.user-avatar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.user-avatar:hover {
  background: rgba(59, 130, 246, 0.1);
}

.avatar-icon {
  font-size: 32px;
  filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.3));
}

.user-name {
  font-size: 14px;
  color: #94a3b8;
  font-weight: 500;
}
</style>
