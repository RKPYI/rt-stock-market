"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

type Props = {
  symbol: string
  company?: string
  isInWatchlist?: boolean
}

export default function WatchlistButton({ symbol, company, isInWatchlist = false }: Props) {
  const [inWatchlist, setInWatchlist] = useState(isInWatchlist)

  function toggle() {
    setInWatchlist((v) => !v)
    console.log(inWatchlist ? `Removed ${symbol} from watchlist` : `Added ${symbol} to watchlist`)
  }

  const base = "w-full text-black"
  const activeClass = "bg-yellow-600 hover:bg-yellow-700"
  const inactiveClass = "bg-yellow-400 hover:bg-yellow-500"

  return (
    <Button
      variant="default"
      className={`${base} ${inWatchlist ? activeClass : inactiveClass}`}
      onClick={toggle}
    >
      {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
    </Button>
  )
}
