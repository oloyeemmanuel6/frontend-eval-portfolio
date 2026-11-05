import { publicUrl } from "../publicUrl.ts"

export type DownloadItem = {
  href: string
  label: string
  note: string
}

export function DownloadList({ items }: { items: readonly DownloadItem[] }) {
  return (
    <ul className="download-list">
      {items.map((item) => (
        <li key={item.href}>
          <a href={publicUrl(item.href)} download>
            {item.label}
          </a>
          <span>{item.note}</span>
        </li>
      ))}
    </ul>
  )
}
