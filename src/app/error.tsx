"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Une erreur est survenue</h2>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-full text-white font-bold"
          style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
