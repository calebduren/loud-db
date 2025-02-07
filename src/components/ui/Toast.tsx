import { Toaster, toast } from 'sonner';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  );
}

export function ToastComponent() {
  const showToast = () => {
    toast.success('This is a success toast!');
    
    setTimeout(() => {
      toast.error('This is an error toast!');
    }, 1000);
    
    setTimeout(() => {
      toast('This is a default toast!', {
        action: {
          label: 'Undo',
          onClick: () => toast('Undo clicked!')
        }
      });
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Toast Notifications</h3>
      <p className="text-sm text-gray-500">Click the button below to preview different types of toasts.</p>
      <button
        onClick={showToast}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Show Toast Examples
      </button>
    </div>
  );
}
