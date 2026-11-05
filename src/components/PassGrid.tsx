import { cellAriaLabel, stateLabel, type Cell, type EvalData } from "../data/evalResults.ts"
import { taskMeta } from "../data/taskMeta.ts"

type Props = {
  data: EvalData
  selectedModel?: string
  selectedTask?: string
  onSelect: (model: string, taskId: string) => void
}

function scoreText(cell: Cell): string {
  if (cell.state === "missing") return "—"
  return cell.score || "—"
}

function CellButton({
  cell,
  pressed,
  onSelect,
}: {
  cell: Cell
  pressed: boolean
  onSelect: (model: string, taskId: string) => void
}) {
  return (
    <button type="button" className="cell-btn" aria-pressed={pressed} onClick={() => onSelect(cell.model, cell.taskId)}>
      <span className="sr-only">{cellAriaLabel(cell)}</span>
      <span className="cell-score">{scoreText(cell)}</span>
      <span className="cell-state">{stateLabel(cell.state)}</span>
      {cell.state === "pending" && <span className="cell-note">incomplete</span>}
      {cell.state === "missing" && <span className="cell-note">not in mean</span>}
      {cell.flags.includes("FORMAT_FAIL") && cell.state === "fail" && <span className="cell-note">format</span>}
    </button>
  )
}

export function PassGrid({ data, selectedModel, selectedTask, onSelect }: Props) {
  return (
    <div className="pass-block">
    <div className="grid-scroll pass-scroll" tabIndex={0} aria-label="Pass grid, scroll sideways if needed">
      <table className="pass-grid">
        <caption>Pass, fail, missing, and judge-pending trials. One trial per cell.</caption>
        <thead>
          <tr>
            <th scope="col">Task</th>
            {data.summaries.map((summary) => (
              <th key={summary.model} scope="col">
                {summary.shortName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.tasks.map((task) => (
            <tr key={task.id}>
              <th scope="row">
                <span className="task-id">{task.id}</span>
                <span className="task-short">{taskMeta(task.id).short}</span>
              </th>
              {data.models.map((model) => {
                const cell = data.cells.find((item) => item.model === model && item.taskId === task.id)
                if (!cell) {
                  return <td key={model}>—</td>
                }
                const pressed = selectedModel === model && selectedTask === task.id
                return (
                  <td key={model} className={`cell cell-${cell.state}`}>
                    <CellButton cell={cell} pressed={pressed} onSelect={onSelect} />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="pass-cards">
      {data.tasks.map((task) => (
        <section key={task.id} className="pass-card" aria-label={`${task.id} ${task.short}`}>
          <h3>
            <span className="task-id">{task.id}</span> {task.short}
          </h3>
          {data.models.map((model) => {
            const cell = data.cells.find((item) => item.model === model && item.taskId === task.id)
            if (!cell) return null
            const pressed = selectedModel === model && selectedTask === task.id
            return (
              <div key={model} className={`cell cell-${cell.state}`}>
                <CellButton cell={cell} pressed={pressed} onSelect={onSelect} />
              </div>
            )
          })}
        </section>
      ))}
    </div>
    </div>
  )
}
