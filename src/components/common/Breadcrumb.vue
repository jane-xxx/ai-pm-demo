<template>
  <div class="breadcrumb">
    <button class="back-btn" @click="$emit('back')">
      ← 返回
    </button>
    <div class="breadcrumb-trail">
      <span
        v-for="(item, index) in items"
        :key="index"
        class="breadcrumb-item"
      >
        {{ item }}
        <span v-if="index < items.length - 1" class="separator">></span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  items: string[]
}>()

defineEmits<{
  (e: 'back'): void
}>()
</script>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.back-btn {
  padding: 8px 16px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  background: rgba(30, 41, 59, 0.8);
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  border-color: #3b82f6;
  color: #e2e8f0;
}

.breadcrumb-trail {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.breadcrumb-item {
  color: #94a3b8;
}

.breadcrumb-item:last-child {
  color: #3b82f6;
  font-weight: 500;
}

.separator {
  margin: 0 8px;
  color: #64748b;
}
</style>
