import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

class MarkdownService {
  private md: MarkdownIt

  constructor() {
    this.md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      highlight: (str, lang) => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`
          } catch (__) {}
        }
        return `<pre class="hljs"><code>${this.md.utils.escapeHtml(str)}</code></pre>`
      },
    })
  }

  render(markdown: string): string {
    return this.md.render(markdown)
  }
}

export const markdownService = new MarkdownService()
