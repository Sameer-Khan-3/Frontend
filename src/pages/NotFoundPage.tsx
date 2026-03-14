// src/pages/NotFoundPage.tsx
export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-(--bg) text-(--text) p-8">
      <h1 className="text-2xl font-semibold">404 - Not Found</h1>
      <p className="mt-2">The page you requested does not exist.</p>
      <a href="/" className="mt-4 inline-block text-blue-600 hover:underline">
        Return to Home
      </a>
    </main>
  );
}


