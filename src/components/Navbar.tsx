import React from 'react'
import { supabase } from '../lib/supabaseClient'
import { Button } from './ui/button'

interface NavbarProps {
  title?: string
}

const Navbar: React.FC<NavbarProps> = ({ title = 'Income/Expense Tracker' }) => {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error(error.message)
  }

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">{title}</h1>
      <Button variant="destructive" onClick={handleLogout}>
        Logout
      </Button>
    </header>
  )
}

export default Navbar
