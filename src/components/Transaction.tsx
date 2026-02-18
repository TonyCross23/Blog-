import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { TransactionType } from '../types/type'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Input } from './ui/input'
import { Button } from './ui/button'

interface Props {
  userId: string
  onSave: () => void
}

const TransactionForm: React.FC<Props> = ({ userId, onSave }) => {
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState<number | ''>('')
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !category) return
    await supabase
      .from('transactions')
      .insert([{ user_id: userId, type, amount, category, note, date: new Date() }])
    setAmount('')
    setCategory('')
    setNote('')
    onSave()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mb-4 space-y-3">
      <div className="flex gap-2">
        <Select onValueChange={(val) => setType(val as TransactionType)} value={type}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          placeholder="Amount"
          className="flex-1"
          required
        />
      </div>
      <Input
        type="text"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Category"
        required
      />
      <Input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" />
      <Button type="submit" className="w-full">
        Add Transaction
      </Button>
    </form>
  )
}

export default TransactionForm
