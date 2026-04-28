import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md animate-fade-in">
        <div className="font-display text-[9rem] font-bold leading-none text-gradient opacity-20 select-none">
          404
        </div>
        <h1 className="font-display text-3xl font-bold text-white mt-2">Page Not Found</h1>
        <p className="text-slate-400 text-sm mt-3">
          The page you're looking for doesn't exist or you don't have permission to access it.
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => navigate(-1)} className="btn-secondary">
            ← Go Back
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
