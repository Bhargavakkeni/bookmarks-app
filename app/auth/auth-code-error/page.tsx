export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-8 shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
        <p className="text-gray-600">
          There was an error during authentication. Please try again.
        </p>
        <a
          href="/login"
          className="inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
        >
          Go to Login
        </a>
      </div>
    </div>
  )
}
