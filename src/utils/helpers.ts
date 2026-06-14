// 生成唯一ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// 格式化时间
export function formatDate(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 清理过期的草稿项目
export function isExpired(days: number, timestamp: string): boolean {
  const diff = Date.now() - new Date(timestamp).getTime()
  return diff > days * 24 * 60 * 60 * 1000
}
