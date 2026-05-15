import { useNavigate } from 'react-router-dom';
import { TriangleAlert } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-2xl shadow-xl p-10 flex flex-col items-center gap-4 max-w-sm w-full text-center">
        <div className="bg-accent/10 p-4 rounded-full">
          <TriangleAlert className="text-accent w-10 h-10" />
        </div>
        <h1 className="text-6xl font-bold text-text">404</h1>
        <p className="text-secondary text-sm">Esta página no existe o no tienes acceso.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-2 w-full bg-primary hover:bg-primary-hover text-white text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
