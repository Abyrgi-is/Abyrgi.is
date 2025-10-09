interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

/**
 * LoadingSpinner - Reusable loading component
 * Used throughout the app for consistent loading states
 */
export default function LoadingSpinner({ 
  message = "Hleður...", 
  fullScreen = true 
}: LoadingSpinnerProps) {
  const containerClass = fullScreen 
    ? "flex items-center justify-center h-screen" 
    : "flex items-center justify-center h-full";

  return (
    <div className={containerClass}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg">{message}</p>
      </div>
    </div>
  );
}