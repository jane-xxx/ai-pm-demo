<template>
  <main class="main-content">
    <slot />
  </main>
</template>

<style scoped>
.main-content {
  flex: 1;
  height: 100vh;
  overflow-y: auto;
  background: #0f172a;
}

.main-content::-webkit-scrollbar {
  width: 6px;
}

.main-content::-webkit-scrollbar-track {
  background: #1e293b;
}

.main-content::-webkit-scrollbar-thumb {
  background: #3b82f6;
  border-radius: 3px;
}
</style>
