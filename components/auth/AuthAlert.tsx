interface AuthAlertProps {
  variant: 'error' | 'success' | 'info';
  message: string;
}

const styles = {
  error: 'bg-red-900/30 border-red-700 text-red-300',
  success: 'bg-emerald-900/30 border-emerald-700 text-emerald-300',
  info: 'bg-blue-900/30 border-blue-700 text-blue-300',
};

const icons = {
  error: '⚠️',
  success: '✓',
  info: 'ℹ️',
};

export function AuthAlert({ variant, message }: AuthAlertProps) {
  return (
    <div className={`p-4 border rounded-xl text-sm flex gap-3 ${styles[variant]}`}>
      <span className="text-lg shrink-0" aria-hidden>{icons[variant]}</span>
      <span>{message}</span>
    </div>
  );
}