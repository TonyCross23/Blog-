import { supabase } from "../lib/supabaseClient"

export const Login = () => {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard` 
      }
    })

    if (error) console.error("Login Error:", error.message)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Welcome to My Blog</h1>
      <button 
        onClick={handleLogin}
        className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
      >
        Sign in with Google
      </button>
    </div>
  )
}