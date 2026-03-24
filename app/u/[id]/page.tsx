"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type LinkItem = {
  id?: string
  user_id?: string
  url?: string
  [key: string]: any
}

export default function PublicProfile() {
  const params = useParams()
  const userId = params?.id as string

  const [links, setLinks] = useState<LinkItem[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (userId) {
      void loadLinks(userId)
    }
  }, [userId])

  async function loadLinks(id: string) {
    try {
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", id)

      if (error) {
        console.error("Load links error:", error.message, error)
        setLinks([])
        return
      }

      setLinks(data || [])
    } catch (error) {
      console.error("Unexpected load links error:", error)
      setLinks([])
    }
  }

  return (
    <div style={main}>
      <h1>User Profile</h1>

      {links.length === 0 ? (
        <p>No links found.</p>
      ) : (
        links.map((link, index) => (
          <div key={link.id || index}>
            {link.url || "No URL"}
          </div>
        ))
      )}
    </div>
  )
}

const main: React.CSSProperties = {
  background: "black",
  color: "gold",
  minHeight: "100vh",
  padding: "40px",
}