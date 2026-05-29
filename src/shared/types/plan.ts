export type PlanId = "starter" | "growth" | "scale"

export interface Plan {
    id: PlanId
    name: string
    price: number
    description: string
    popular?: boolean
    features: string[]
    limits: {
        channels: number | "unlimited"
        aiAgents: number | "unlimited"
        messages: number | "unlimited"
    }
}