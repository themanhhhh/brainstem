import { mockData, mockApiResponse, paginateData } from '../../data/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));
const normalize = value => (value ?? '').toString().toLowerCase();
const toNumber = value => (value === undefined || value === null || value === '') ? undefined : Number(value);

const calculateProfit = campaign =>
  (campaign.actualRevenue ?? 0) - (campaign.actualCost ?? 0);

const calculateRoi = campaign => {
  const cost = campaign.actualCost ?? 0;
  if (!cost) return 0;
  return Number((((campaign.actualRevenue ?? 0) - cost) / cost).toFixed(2));
};

const calculateConversionRate = campaign => {
  const leads = campaign.potentialStudents ?? 0;
  if (!leads) return 0;
  return Number(((campaign.newStudents ?? 0) / leads).toFixed(2));
};

const enrichCampaign = campaign => {
  const staff = mockData.staffMembers.find(item => item.id === campaign.responsibleStaffId) || null;
  const channels = mockData.channels.filter(channel =>
    Array.isArray(campaign.channelIds) && campaign.channelIds.includes(channel.id)
  );

  const profit = calculateProfit(campaign);
  const roi = calculateRoi(campaign);
  const conversionRate = calculateConversionRate(campaign);

  return {
    ...campaign,
    profit,
    roi,
    conversionRate,
    responsibleStaffName: staff?.fullName ?? null,
    channelSummaries: channels.map(channel => ({
      id: channel.id,
      name: channel.name,
      type: channel.type,
      status: channel.status
    })),
    durationDays: Math.ceil(
      (new Date(campaign.endDate ?? campaign.startDate).getTime() -
        new Date(campaign.startDate ?? campaign.endDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  };
};

const sortCampaigns = (campaigns, sortBy = 'startDate', sortDirection = 'desc') => {
  const direction = sortDirection === 'asc' ? 1 : -1;

  const valueOf = campaign => {
    switch (sortBy) {
      case 'actualCost':
        return campaign.actualCost ?? 0;
      case 'actualRevenue':
        return campaign.actualRevenue ?? 0;
      case 'profit':
        return calculateProfit(campaign);
      case 'roi':
        return calculateRoi(campaign);
      case 'newStudents':
        return campaign.newStudents ?? 0;
      case 'conversionRate':
        return calculateConversionRate(campaign);
      case 'name':
        return normalize(campaign.name);
      default:
        return new Date(campaign.startDate ?? 0).getTime();
    }
  };

  return [...campaigns].sort((a, b) => {
    const valueA = valueOf(a);
    const valueB = valueOf(b);

    if (valueA < valueB) return -1 * direction;
    if (valueA > valueB) return 1 * direction;
    return 0;
  });
};

const filterByTimeframe = (campaign, start, end) => {
  if (!start && !end) return true;

  const startDate = new Date(campaign.startDate ?? 0).getTime();
  const endDate = new Date(campaign.endDate ?? 0).getTime();
  const from = start ? new Date(start).getTime() : null;
  const to = end ? new Date(end).getTime() : null;

  if (from && endDate < from) return false;
  if (to && startDate > to) return false;
  return true;
};

const metricsWithinRange = (metrics = [], start, end) => {
  if (!start && !end) return metrics;

  const fromMonth = start ? start.slice(0, 7) : null;
  const toMonth = end ? end.slice(0, 7) : null;

  return metrics.filter(entry => {
    const month = entry.month;
    if (fromMonth && month < fromMonth) return false;
    if (toMonth && month > toMonth) return false;
    return true;
  });
};

const aggregateMetrics = metrics =>
  metrics.reduce(
    (acc, entry) => {
      acc.spend += entry.spend ?? 0;
      acc.leads += entry.leads ?? 0;
      acc.newStudents += entry.newStudents ?? 0;
      acc.revenue += entry.revenue ?? 0;
      acc.profit += entry.profit ?? 0;
      return acc;
    },
    { spend: 0, leads: 0, newStudents: 0, revenue: 0, profit: 0 }
  );

export const campaignService = {
  getCampaigns: async (options = {}) => {
    const {
      page = 0,
      size = 20,
      search = '',
      status,
      channelId,
      staffId,
      sortBy,
      sortDirection,
      minRoi,
      maxRoi,
      timeframeStart,
      timeframeEnd
    } = options;

    await delay();

    const searchTerm = normalize(search).trim();
    const channelFilter = toNumber(channelId);
    const staffFilter = toNumber(staffId);
    const minRoiNumber = minRoi === undefined ? undefined : Number(minRoi);
    const maxRoiNumber = maxRoi === undefined ? undefined : Number(maxRoi);

    let campaigns = mockData.campaigns.filter(campaign =>
      filterByTimeframe(campaign, timeframeStart, timeframeEnd)
    );

    if (searchTerm) {
      campaigns = campaigns.filter(campaign =>
        [campaign.name, campaign.campaignCode, campaign.description]
          .map(normalize)
          .some(value => value.includes(searchTerm))
      );
    }

    if (status) {
      campaigns = campaigns.filter(campaign => campaign.status === status);
    }

    if (channelFilter !== undefined) {
      campaigns = campaigns.filter(
        campaign =>
          Array.isArray(campaign.channelIds) && campaign.channelIds.includes(channelFilter)
      );
    }

    if (staffFilter !== undefined) {
      campaigns = campaigns.filter(campaign => campaign.responsibleStaffId === staffFilter);
    }

    if (minRoiNumber !== undefined) {
      campaigns = campaigns.filter(campaign => calculateRoi(campaign) >= minRoiNumber);
    }

    if (maxRoiNumber !== undefined) {
      campaigns = campaigns.filter(campaign => calculateRoi(campaign) <= maxRoiNumber);
    }

    campaigns = sortCampaigns(campaigns, sortBy, sortDirection);

    const enriched = campaigns.map(enrichCampaign);
    const result = paginateData(enriched, page, size);

    return mockApiResponse(result.data, result.metadata);
  },

  getCampaignSummary: async () => {
    await delay();

    const totals = mockData.campaigns.reduce(
      (acc, campaign) => {
        acc.total += 1;
        acc.totalSpent += campaign.actualCost ?? 0;
        acc.totalRevenue += campaign.actualRevenue ?? 0;
        acc.newStudents += campaign.newStudents ?? 0;

        acc.byStatus[campaign.status] = (acc.byStatus[campaign.status] ?? 0) + 1;

        return acc;
      },
      { total: 0, totalSpent: 0, totalRevenue: 0, newStudents: 0, byStatus: {} }
    );

    totals.totalProfit = totals.totalRevenue - totals.totalSpent;
    totals.averageRoi = totals.total
      ? Number(
          (
            mockData.campaigns.reduce((sum, campaign) => sum + calculateRoi(campaign), 0) /
            totals.total
          ).toFixed(2)
        )
      : 0;

    const topCampaigns = [...mockData.campaigns]
      .sort((a, b) => calculateRoi(b) - calculateRoi(a))
      .slice(0, 3)
      .map(enrichCampaign);

    return mockApiResponse({
      totalCampaigns: totals.total,
      statusCounts: totals.byStatus,
      totalSpent: totals.totalSpent,
      totalRevenue: totals.totalRevenue,
      totalProfit: totals.totalProfit,
      averageRoi: totals.averageRoi,
      newStudents: totals.newStudents,
      topCampaigns
    });
  },

  getCampaignById: async id => {
    await delay();

    const numericId = Number(id);
    const campaign = mockData.campaigns.find(item => item.id === numericId);

    if (!campaign) {
      return mockApiResponse(null, null);
    }

    const relatedLeads = mockData.potentialStudents.filter(
      lead => lead.campaignId === numericId
    );

    const relatedStudents = mockData.students.filter(
      student => student.campaignId === numericId
    );

    const relatedRevenue = mockData.revenueRecords.filter(
      record => record.campaignId === numericId
    );

    const metricsHistory = campaign.metricsHistory ?? [];
    const aggregatedMetrics = aggregateMetrics(metricsHistory);

    return mockApiResponse({
      ...enrichCampaign(campaign),
      metricsHistory,
      aggregatedMetrics,
      relatedCounts: {
        leads: relatedLeads.length,
        convertedLeads: relatedLeads.filter(lead => lead.status === 'REGISTERED').length,
        students: relatedStudents.length,
        revenueTransactions: relatedRevenue.length,
        revenue: relatedRevenue.reduce((sum, record) => sum + (record.netAmount ?? 0), 0)
      }
    });
  },

  getCampaignMetrics: async (id, options = {}) => {
    const { timeframeStart, timeframeEnd } = options;

    await delay();

    const numericId = Number(id);
    const campaign = mockData.campaigns.find(item => item.id === numericId);

    if (!campaign) {
      return mockApiResponse(null, null);
    }

    const filteredMetrics = metricsWithinRange(
      campaign.metricsHistory ?? [],
      timeframeStart,
      timeframeEnd
    );

    return mockApiResponse({
      metrics: filteredMetrics,
      aggregated: aggregateMetrics(filteredMetrics)
    });
  },

  addCampaign: async campaign => {
    await delay(600);

    const ids = mockData.campaigns.map(item => item.id);
    const nextId = ids.length ? Math.max(...ids) + 1 : 1;

    const newCampaign = {
      id: nextId,
      campaignCode: campaign.campaignCode || `CMP-${nextId.toString().padStart(4, '0')}`,
      name: campaign.name,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      status: campaign.status || 'PLANNING',
      channelIds: Array.isArray(campaign.channelIds) ? campaign.channelIds : [],
      budget: campaign.budget ?? 0,
      actualCost: campaign.actualCost ?? 0,
      expectedRevenue: campaign.expectedRevenue ?? 0,
      actualRevenue: campaign.actualRevenue ?? 0,
      expectedStudents: campaign.expectedStudents ?? 0,
      newStudents: campaign.newStudents ?? 0,
      potentialStudents: campaign.potentialStudents ?? 0,
      responsibleStaffId: campaign.responsibleStaffId ?? null,
      goalRevenue: campaign.goalRevenue ?? 0,
      goalNewStudents: campaign.goalNewStudents ?? 0,
      goalLeads: campaign.goalLeads ?? 0,
      tags: Array.isArray(campaign.tags) ? campaign.tags : [],
      description: campaign.description ?? null,
      metricsHistory: Array.isArray(campaign.metricsHistory) ? campaign.metricsHistory : [],
      createdAt: campaign.createdAt || new Date().toISOString(),
      updatedAt: campaign.updatedAt || new Date().toISOString()
    };

    newCampaign.roi = calculateRoi(newCampaign);
    newCampaign.conversionRate = calculateConversionRate(newCampaign);

    mockData.campaigns.push(newCampaign);
    return mockApiResponse(enrichCampaign(newCampaign));
  },

  updateCampaign: async (id, updates) => {
    await delay(600);

    const numericId = Number(id);
    const index = mockData.campaigns.findIndex(item => item.id === numericId);

    if (index === -1) {
      throw new Error('Campaign not found');
    }

    const existing = mockData.campaigns[index];
    const merged = {
      ...existing,
      ...updates,
      channelIds: Array.isArray(updates.channelIds)
        ? updates.channelIds
        : existing.channelIds,
      tags: Array.isArray(updates.tags) ? updates.tags : existing.tags,
      metricsHistory: Array.isArray(updates.metricsHistory)
        ? updates.metricsHistory
        : existing.metricsHistory,
      updatedAt: updates.updatedAt || new Date().toISOString()
    };

    merged.roi = calculateRoi(merged);
    merged.conversionRate = calculateConversionRate(merged);

    mockData.campaigns[index] = merged;

    return mockApiResponse(enrichCampaign(mockData.campaigns[index]));
  },

  deleteCampaign: async id => {
    await delay(600);

    const numericId = Number(id);
    const index = mockData.campaigns.findIndex(item => item.id === numericId);

    if (index === -1) {
      throw new Error('Campaign not found');
    }

    const [deletedCampaign] = mockData.campaigns.splice(index, 1);
    return mockApiResponse(enrichCampaign(deletedCampaign));
  }
};
