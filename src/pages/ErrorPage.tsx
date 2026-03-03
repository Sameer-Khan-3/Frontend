// src/pages/ErrorPage.tsx
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();

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
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>{title}</h1>
      {status && <p style={{ color: '#666' }}>Error code: {status}</p>}
      <p>{message}</p>
      <a href="/">Go home</a>
    </main>
  );
}
