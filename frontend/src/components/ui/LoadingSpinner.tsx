export function LoadingSpinner({ fullScreen = false }: { fullScreen?: boolean }) {
  const spinner = (
    <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-green-600" />
  );
  if (fullScreen) {
    return <div className="flex items-center justify-center min-h-screen">{spinner}</div>;
  }
  return <div className="flex items-center justify-center py-12">{spinner}</div>;
}
