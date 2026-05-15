import { Component} from 'react'
import type { ErrorInfo, ReactNode  } from 'react'

 interface Props {
    children: ReactNode
  }

  interface State {
    hasError: boolean
  }

  class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false }

    static getDerivedStateFromError(): State {
      return { hasError: true }
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
      console.error('ErrorBoundary caught:', error, info)
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h1 className="text-2xl font-semibold text-gray-800">Algo salió mal</h1>
            <p className="text-gray-500">Ocurrió un error inesperado.</p>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => window.location.reload()}
            >
              Recargar página
            </button>
          </div>
        )
      }

      return this.props.children
    }
  }

  export default ErrorBoundary;