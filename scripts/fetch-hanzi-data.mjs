import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(__dirname, '../public/hanzi-data')

const FILES = [
  {
    name: 'graphics.txt',
    url: 'https://raw.githubusercontent.com/skishore/makemeahanzi/master/graphics.txt'
  },
  {
    name: 'dictionary.txt',
    url: 'https://raw.githubusercontent.com/skishore/makemeahanzi/master/dictionary.txt'
  }
]

async function download(file) {
  console.log(`下载 ${file.name} ...`)
  const res = await fetch(file.url)
  if (!res.ok) throw new Error(`下载失败 ${file.name}: ${res.status}`)
  const text = await res.text()
  const outPath = resolve(OUT_DIR, file.name)
  await writeFile(outPath, text, 'utf8')
  const lines = text.trim().split('\n').length
  console.log(`  已写入 ${outPath}（${lines} 行）`)
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  for (const file of FILES) {
    await download(file)
  }
  console.log('汉字数据下载完成。')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
