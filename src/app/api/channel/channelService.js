import { mockData, mockApiResponse, paginateData } from '../../data/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));
const normalize = value => (value ?? '').toString().toLowerCase();
const toNumber = value => (value === undefined || value === null || value === '') ? undefined : Number(value);

const filterStatsByRange = (stats = [], { month, startMonth, endMonth } = {}) => {
  if (month) {
    return stats.filter(entry => entry.month === month);
  }

  const from = startMonth ?? null;
  const to = endMonth ?? null;

  if (!from && !to) return stats;

  return stats.filter(entry => {
    const current = entry.month;
    if (from && current < from) return false;
    if (to && current > to) return false;
    return true;
  });
};

const aggregateStats = stats =>
  stats.reduce(
    (acc, entry) => {
      acc.spend += entry.spend ?? 0;
      acc.leads += entry.leads ?? 0;
      acc.newStudents += entry.newStudents ?? 0;
      acc.revenue += entry.revenue ?? 0;
      return acc;
    },
    { spend: 0, leads: 0, newStudents: 0, revenue: 0 }
  );

const calculateChannelRoi = ({ spend, revenue }) => {
  if (!spend) return 0;
  return Number(((revenue - spend) / spend).toFixed(2));
};

const getChannelMetrics = (channel, options = {}) => {
  const stats = filterStatsByRange(channel.monthlyStats ?? [], options);
  const aggregated = aggregateStats(stats);

  return {
    ...aggregated,
    roi: calculateChannelRoi(aggregated),
    stats
  };
};

const enrichChannel = (channel, options = {}) => {
  const metrics = getChannelMetrics(channel, options);
  const campaigns = mockData.campaigns.filter(campaign =>
    Array.isArray(campaign.channelIds) && campaign.channelIds.includes(channel.id)
  );

  return {
    ...channel,
    metrics,
    campaignCount: campaigns.length
  };
};

const sortChannels = (channels, sortBy = 'name', sortDirection = 'asc') => {
  const direction = sortDirection === 'desc' ? -1 : 1;

  const getValue = channel => {
    switch (sortBy) {
      case 'spend':
        return channel.metrics.spend ?? 0;
      case 'revenue':
        return channel.metrics.revenue ?? 0;
      case 'leads':
        return channel.metrics.leads ?? 0;
      case 'newStudents':
        return channel.metrics.newStudents ?? 0;
      case 'roi':
        return channel.metrics.roi ?? 0;
      default:
        return normalize(channel.name);
    }
  };

  return [...channels].sort((a, b) => {
    const valueA = getValue(a);
    const valueB = getValue(b);

    if (valueA < valueB) return -1 * direction;
    if (valueA > valueB) return 1 * direction;
    return 0;
  });
};

const calculateCampaignRoi = campaign => {
  const cost = campaign.actualCost ?? 0;
  if (!cost) return 0;
  return Number((((campaign.actualRevenue ?? 0) - cost) / cost).toFixed(2));
};

const calculateCampaignConversionRate = campaign => {
  const leads = campaign.potentialStudents ?? 0;
  if (!leads) return 0;
  return Number(((campaign.newStudents ?? 0) / leads).toFixed(2));
};

const sortChannelCampaigns = (campaigns, sortBy = 'roi', sortDirection = 'desc') => {
  const direction = sortDirection === 'asc' ? 1 : -1;

  const getValue = campaign => {
    switch (sortBy) {
      case 'actualCost':
        return campaign.actualCost ?? 0;
      case 'actualRevenue':
        return campaign.actualRevenue ?? 0;
      case 'profit':
        return (campaign.actualRevenue ?? 0) - (campaign.actualCost ?? 0);
      case 'roi':
        return calculateCampaignRoi(campaign);
      case 'newStudents':
        return campaign.newStudents ?? 0;
      case 'conversionRate':
        return campaign.conversionRate ?? 0;
      default:
        return normalize(campaign.name);
    }
  };

  return [...campaigns].sort((a, b) => {
    const valueA = getValue(a);
    const valueB = getValue(b);

    if (valueA < valueB) return -1 * direction;
    if (valueA > valueB) return 1 * direction;
    return 0;
  });
};

export const channelService = {
  getChannels: async (options = {}) => {
    const {
      page = 0,
      size = 20,
      search = '',
      type,
      status,
      sortBy,
      sortDirection,
      month,
      startMonth,
      endMonth
    } = options;

    await delay();

    const searchTerm = normalize(search).trim();

    let channels = mockData.channels.map(channel =>
      enrichChannel(channel, { month, startMonth, endMonth })
    );

    if (searchTerm) {
      channels = channels.filter(channel =>
        [channel.name, channel.owner, channel.notes]
          .map(normalize)
          .some(value => value.includes(searchTerm))
      );
    }

    if (type) {
      channels = channels.filter(channel => channel.type === type);
    }

    if (status) {
      channels = channels.filter(channel => channel.status === status);
    }

    channels = sortChannels(channels, sortBy, sortDirection);

    const result = paginateData(channels, page, size);
    return mockApiResponse(result.data, result.metadata);
  },

  getChannelSummary: async (options = {}) => {
    const { month, startMonth, endMonth } = options;

    await delay();

    const enriched = mockData.channels.map(channel =>
      enrichChannel(channel, { month, startMonth, endMonth })
    );

    const totals = enriched.reduce(
      (acc, channel) => {
        acc.total += 1;
        acc.spend += channel.metrics.spend;
        acc.revenue += channel.metrics.revenue;
        acc.leads += channel.metrics.leads;
        acc.newStudents += channel.metrics.newStudents;

        acc.byType[channel.type] = (acc.byType[channel.type] ?? 0) + 1;
        acc.byStatus[channel.status] = (acc.byStatus[channel.status] ?? 0) + 1;

        return acc;
      },
      {
        total: 0,
        spend: 0,
        revenue: 0,
        leads: 0,
        newStudents: 0,
        byType: {},
        byStatus: {}
      }
    );

    const roi = calculateChannelRoi(totals);

    const topChannels = [...enriched]
      .sort((a, b) => b.metrics.roi - a.metrics.roi)
      .slice(0, 3);

    return mockApiResponse({
      totalChannels: totals.total,
      spend: totals.spend,
      revenue: totals.revenue,
      newStudents: totals.newStudents,
      leads: totals.leads,
      averageRoi: totals.total ? Number(roi.toFixed(2)) : 0,
      byType: totals.byType,
      byStatus: totals.byStatus,
      topChannels
    });
  },

  getChannelById: async (id, options = {}) => {
    const { month, startMonth, endMonth, includeCampaigns = true } = options;

    await delay();

    const numericId = Number(id);
    const channel = mockData.channels.find(item => item.id === numericId);

    if (!channel) {
      return mockApiResponse(null, null);
    }

    const enriched = enrichChannel(channel, { month, startMonth, endMonth });

    if (!includeCampaigns) {
      return mockApiResponse(enriched);
    }

    const campaigns = mockData.campaigns
      .filter(campaign => Array.isArray(campaign.channelIds) && campaign.channelIds.includes(numericId))
      .map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        actualCost: campaign.actualCost,
        actualRevenue: campaign.actualRevenue,
        roi: calculateRoi(campaign),
        newStudents: campaign.newStudents
      }));

    return mockApiResponse({
      ...enriched,
      campaigns
    });
  },

  getChannelCampaigns: async (id, options = {}) => {
    const {
      page = 0,
      size = 20,
      sortBy = 'roi',
      sortDirection = 'desc'
    } = options;

    await delay();

    const numericId = Number(id);
    const channel = mockData.channels.find(item => item.id === numericId);

    if (!channel) {
      return mockApiResponse([], { page: 0, size, totalElements: 0, totalPages: 0 });
    }

    const campaigns = mockData.campaigns
      .filter(campaign => Array.isArray(campaign.channelIds) && campaign.channelIds.includes(numericId))
      .map(campaign => ({
        ...campaign,
        roi: calculateCampaignRoi(campaign),
        profit: (campaign.actualRevenue ?? 0) - (campaign.actualCost ?? 0),
        conversionRate: calculateCampaignConversionRate(campaign)
      }));

    const sorted = sortChannelCampaigns(campaigns, sortBy, sortDirection);
    const result = paginateData(sorted, page, size);

    return mockApiResponse(result.data, result.metadata);
  }
};
