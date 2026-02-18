import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Transaction } from '../types/type'
import { Badge } from './ui/badge'

interface Props {
  userId: string
}

const TransactionList: React.FC<Props> = ({ userId }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    const fetchTransactions = async () => {
      const { data } = await supabase
        .from<Transaction>('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
      setTransactions(data || [])
    }
    fetchTransactions()
  }, [userId])

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="w-full table-auto">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Category</th>
            <th className="p-2 text-left">Note</th>
            <th className="p-2 text-right">Amount</th>
            <th className="p-2 text-left">Type</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-b">
              <td className="p-2">{tx.category}</td>
              <td className="p-2">{tx.note}</td>
              <td className="p-2 text-right">{tx.amount}</td>
              <td className="p-2">
                <Badge variant={tx.type === 'income' ? 'default' : 'destructive'}>{tx.type}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TransactionList
