import { Component, type ErrorInfo, type ReactNode } from "react"

type Props = { children: ReactNode }
type State = { error: Error | null }

export class DataBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error.message, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div role="alert" className="alert">
        <h2>These figures could not be read</h2>
        <p>The graded files did not load. No score on this page was filled in to replace them.</p>
        <pre>{this.state.error.message}</pre>
      </div>
    )
  }
}
