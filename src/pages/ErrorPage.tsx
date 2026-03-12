// src/pages/ErrorPage.tsx
import { isRouteErrorResponse, useLocation, useRouteError } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();
  const location = useLocation();
  const state = location.state as
    | { status?: number; title?: string; message?: string }
    | null;

  // Default display values
  let title = 'Something went wrong';
  let message = 'An unexpected error occurred. Please try again later.';
  let status: number | undefined;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    // Common HTTP statuses: 400, 401, 403, 404, 500, etc.
    if (status === 404) {
      title = 'Page not found';
      message = 'The page you are looking for might have been moved or deleted.';
    } else if (status === 401) {
      title = 'Unauthorized';
      message = 'Please sign in to continue.';
    } else if (status === 403) {
      title = 'Forbidden';
      message = 'You do not have permission to view this resource.';
    } else if (status >= 500) {
      title = 'Server error';
      message = 'Our servers are having trouble. Please try again later.';
    } else {
      message = error.statusText || message;
    }
  } else if (error instanceof Error) {
    // Errors thrown by components (e.g., fetch failures)
    message = error.message || message;
  } else if (state?.status) {
    status = state.status;
    if (state.title) title = state.title;
    if (state.message) {
      message = state.message;
    } else if (status === 401) {
      title = 'Unauthorized';
      message = 'Please sign in to continue.';
    } else if (status === 403) {
      title = 'Forbidden';
      message = 'You do not have permission to view this resource.';
    }
  } else if (state?.title || state?.message) {
    title = state.title || title;
    message = state.message || message;
  }

  return (
    <main className="min-h-screen bg-(--bg) text-(--text) p-8">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {status && (
        <p className="text-(--text-muted)">Error code: {status}</p>
      )}
      <p className="mt-2">{message}</p>
      <a href="/" className="mt-4 inline-block text-blue-600 hover:underline">
        Go home
      </a>
    </main>
  );
}
