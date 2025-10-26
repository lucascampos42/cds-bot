export interface ICampaign {
  id: string;
  name: string;
  description: string;
  type: 'broadcast' | 'drip' | 'triggered';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  targetAudience: string[];
  content: {
    message: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'document';
  };
  schedule?: {
    startDate: Date;
    endDate?: Date;
    frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
  };
  triggers?: {
    event: string;
    conditions: Record<string, any>;
  }[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  metrics: {
    sent: number;
    delivered: number;
    read: number;
    clicked: number;
    converted: number;
  };
}

export interface IContentTemplate {
  id: string;
  name: string;
  category: 'promotional' | 'informational' | 'transactional' | 'seasonal';
  content: {
    message: string;
    variables: string[];
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'document';
  };
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
}

export interface IBroadcastMessage {
  sessionId: string;
  recipients: string[];
  message: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'document';
  campaignId?: string;
}

export interface ICampaignMetrics {
  campaignId: string;
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalClicked: number;
  totalConverted: number;
  deliveryRate: number;
  readRate: number;
  clickRate: number;
  conversionRate: number;
  roi: number;
  cost: number;
  revenue: number;
}

export interface IAnalyticsEvent {
  id: string;
  campaignId: string;
  type: 'sent' | 'delivered' | 'read' | 'clicked' | 'converted' | 'bounced';
  recipient: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface IMarketingService {
  // Gestão de campanhas
  createCampaign(campaignData: Partial<ICampaign>): Promise<ICampaign>;
  getCampaign(campaignId: string): Promise<ICampaign | null>;
  getCampaigns(filters?: {
    status?: string;
    type?: string;
  }): Promise<ICampaign[]>;
  updateCampaign(
    campaignId: string,
    updates: Partial<ICampaign>,
  ): Promise<ICampaign>;
  deleteCampaign(campaignId: string): Promise<void>;

  // Execução de campanhas
  startCampaign(campaignId: string): Promise<void>;
  pauseCampaign(campaignId: string): Promise<void>;
  sendBroadcast(broadcastData: IBroadcastMessage): Promise<string[]>;

  // Templates de conteúdo
  getTemplates(category?: string): Promise<IContentTemplate[]>;
  getTemplate(templateId: string): Promise<IContentTemplate | null>;
  renderTemplate(
    templateId: string,
    variables: Record<string, string>,
  ): Promise<string>;

  // Analytics
  getCampaignMetrics(campaignId: string): Promise<ICampaignMetrics>;
  getAnalytics(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalCampaigns: number;
    totalSent: number;
    averageDeliveryRate: number;
    averageReadRate: number;
    averageConversionRate: number;
    topPerformingCampaigns: ICampaign[];
  }>;

  // Eventos
  onCampaignStart(callback: (campaign: ICampaign) => void): void;
  onCampaignComplete(callback: (campaign: ICampaign) => void): void;
  onMessageSent(callback: (event: IAnalyticsEvent) => void): void;
}
