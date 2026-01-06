"use client"

import { createContext } from "react"

type ClientSplitViewTransitionContextValue = {
  isTransitionsEnabled: boolean
}

const ClientSplitViewTransitionContext = createContext<ClientSplitViewTransitionContextValue>({
  isTransitionsEnabled: true
})

export default ClientSplitViewTransitionContext

