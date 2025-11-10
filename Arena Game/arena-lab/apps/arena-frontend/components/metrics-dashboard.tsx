"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, TrendingUp, Zap, Clock } from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export function MetricsDashboard() {
  const [liveData, setLiveData] = useState<any[]>([])

  // Simulate live data updates
  useEffect(() => {
    const initialData = Array.from({ length: 20 }, (_, i) => ({
      epoch: i + 1,
      loss: 0.8 - i * 0.03 + Math.random() * 0.05,
      accuracy: 0.6 + i * 0.015 + Math.random() * 0.02,
      valLoss: 0.85 - i * 0.028 + Math.random() * 0.06,
      valAccuracy: 0.58 + i * 0.014 + Math.random() * 0.025,
    }))
    setLiveData(initialData)

    const interval = setInterval(() => {
      setLiveData((prev) => {
        const lastEpoch = prev[prev.length - 1]
        const newEpoch = {
          epoch: lastEpoch.epoch + 1,
          loss: Math.max(0.1, lastEpoch.loss - 0.01 + Math.random() * 0.02),
          accuracy: Math.min(0.99, lastEpoch.accuracy + 0.005 + Math.random() * 0.01),
          valLoss: Math.max(0.12, lastEpoch.valLoss - 0.008 + Math.random() * 0.02),
          valAccuracy: Math.min(0.98, lastEpoch.valAccuracy + 0.004 + Math.random() * 0.01),
        }
        return [...prev.slice(-19), newEpoch]
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const latestMetrics = liveData[liveData.length - 1] || { loss: 0, accuracy: 0, valLoss: 0, valAccuracy: 0 }
  const previousMetrics = liveData[liveData.length - 2] || latestMetrics

  const metrics = [
    {
      label: "Accuracy",
      value: (latestMetrics.accuracy * 100).toFixed(2) + "%",
      change: ((latestMetrics.accuracy - previousMetrics.accuracy) * 100).toFixed(2),
      icon: Activity,
      color: "text-success",
    },
    {
      label: "Loss",
      value: latestMetrics.loss.toFixed(4),
      change: (latestMetrics.loss - previousMetrics.loss).toFixed(4),
      icon: Zap,
      color: "text-primary",
    },
    {
      label: "Val Accuracy",
      value: (latestMetrics.valAccuracy * 100).toFixed(2) + "%",
      change: ((latestMetrics.valAccuracy - previousMetrics.valAccuracy) * 100).toFixed(2),
      icon: TrendingUp,
      color: "text-chart-2",
    },
    {
      label: "Val Loss",
      value: latestMetrics.valLoss.toFixed(4),
      change: (latestMetrics.valLoss - previousMetrics.valLoss).toFixed(4),
      icon: Clock,
      color: "text-chart-4",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Live Metrics</h3>
        <div className="flex-1 flex justify-end">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 gap-2">
        {metrics.map((metric) => {
          const Icon = metric.icon
          const isPositive = Number.parseFloat(metric.change) > 0
          const isLossMetric = metric.label.toLowerCase().includes("loss")
          const trendPositive = isLossMetric ? !isPositive : isPositive

          return (
            <Card key={metric.label} className="p-3">
              <div className="flex items-start justify-between mb-2">
                <Icon className={`h-4 w-4 ${metric.color}`} />
                <Badge variant={trendPositive ? "default" : "secondary"} className="text-[10px] h-5 px-1.5">
                  {isPositive ? "+" : ""}
                  {metric.change}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className="text-lg font-bold font-mono">{metric.value}</p>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Loss Curve */}
      <Card className="p-3">
        <h4 className="text-xs font-semibold mb-2">Training Loss</h4>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={liveData}>
            <defs>
              <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="valLossGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="epoch" stroke="hsl(var(--muted-foreground))" fontSize={10} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} domain={[0, 1]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                fontSize: "11px",
              }}
            />
            <Area
              type="monotone"
              dataKey="loss"
              stroke="hsl(var(--primary))"
              fill="url(#lossGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="valLoss"
              stroke="hsl(var(--chart-4))"
              fill="url(#valLossGradient)"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Accuracy Curve */}
      <Card className="p-3">
        <h4 className="text-xs font-semibold mb-2">Accuracy Progress</h4>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={liveData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="epoch" stroke="hsl(var(--muted-foreground))" fontSize={10} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} domain={[0.5, 1]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                fontSize: "11px",
              }}
            />
            <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
            <Line
              type="monotone"
              dataKey="valAccuracy"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Performance Bar */}
      <Card className="p-3">
        <h4 className="text-xs font-semibold mb-2">Epoch Performance</h4>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={liveData.slice(-10)}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="epoch" stroke="hsl(var(--muted-foreground))" fontSize={10} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} domain={[0, 1]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                fontSize: "11px",
              }}
            />
            <Bar dataKey="accuracy" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
