export type ChannelType = "whatsapp" | "sms" | "webchat" | "email"

export type ChannelStatus = "active" | "inactive" | "error"

export interface Channel {
    id: ChannelType
    businessId: string
    name: string
    status: ChannelStatus
    enabled: boolean
    connected: boolean
}