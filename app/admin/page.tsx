"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type User = {
  id: string
  email: string
}

export default function Admin() {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("users")
      .select("*")

    if (error) {
      console.log(error)
      return
    }

    setUsers(data || [])
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Panel</h1>

      {users.map((user) => (
        <div key={user.id}>
          {user.email}
        </div>
      ))}
    </div>
  )
}