<template>
  <main class="main-content">
    <slot />
  </main>
</template>

<style scoped>
.main-content {
  flex: 1;
  overflow-y: auto;
  background: linear-gradient(180deg, #0F111A 0%, #1A1F2E 100%);
}

.main-content::-webkit-scrollbar {
  width: 6px;
}

.main-content::-webkit-scrollbar-track {
  background: #1A1F2E;
}

.main-content::-webkit-scrollbar-thumb {
  background: #6366F1;
  border-radius: 3px;
}
</style>
