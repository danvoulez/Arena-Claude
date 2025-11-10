"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useArenaStore } from "@/lib/store"
import { Trash2, Plus } from "lucide-react"
import { useState } from "react"

export function EnvironmentManager() {
  const { activeEnvironmentId, environments, updateEnvironment } = useArenaStore()
  const activeEnv = environments.find((e) => e.id === activeEnvironmentId)

  const [newKey, setNewKey] = useState("")
  const [newValue, setNewValue] = useState("")

  if (!activeEnv) return null

  const variables = Object.entries(activeEnv.variables)

  const handleAdd = () => {
    if (newKey.trim() && activeEnvironmentId) {
      updateEnvironment(activeEnvironmentId, {
        variables: {
          ...activeEnv.variables,
          [newKey]: newValue,
        },
      })
      setNewKey("")
      setNewValue("")
    }
  }

  const handleDelete = (key: string) => {
    if (activeEnvironmentId) {
      const { [key]: _, ...rest } = activeEnv.variables
      updateEnvironment(activeEnvironmentId, { variables: rest })
    }
  }

  const handleUpdate = (key: string, value: string) => {
    if (activeEnvironmentId) {
      updateEnvironment(activeEnvironmentId, {
        variables: {
          ...activeEnv.variables,
          [key]: value,
        },
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {variables.map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <Input value={key} disabled className="flex-1" />
            <Input
              value={value}
              onChange={(e) => handleUpdate(key, e.target.value)}
              className="flex-1"
              placeholder="value"
            />
            <Button variant="ghost" size="icon" onClick={() => handleDelete(key)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t space-y-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="VARIABLE_NAME"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleAdd} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
