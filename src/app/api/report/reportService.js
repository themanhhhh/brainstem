import { mockData, mockApiResponse } from '../../data/mockData';

const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));
const parseDate = value => (value ? new Date(value) : null);

const filterTimeseries = (series = [], startDate, endDate) => {
  const from = parseDate(startDate);
  const to = parseDate(endDate);

  if (!from && !to) return series;

  return series.filter(entry => {
    const current = parseDate(entry.date);
    if (!current) return false;
    if (from && current < from) return false;
    if (to && current > to) return false;
    return true;
  });
};

const sortByValue = (items, key, direction = 'desc') => {
  const multiplier = direction === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    const valueA = a[key] ?? 0;
    const valueB = b[key] ?? 0;

    if (valueA < valueB) return -1 * multiplier;
    if (valueA > valueB) return 1 * multiplier;
    return 0;
  });
};

const calculateSnapshot = () => {
  const totalStudents = mockData.students.length;
  const newStudentsThisMonth = mockData.students.filter(student => {
    const enrollment = parseDate(student.enrollmentDate);
    const now = new Date();
    return (
      enrollment &&
      enrollment.getMonth() === now.getMonth() &&
      enrollment.getFullYear() === now.getFullYear()
    );
  }).length;

  const revenueTotals = mockData.revenueRecords.reduce(
    (acc, record) => {
      acc.netAmount += record.netAmount ?? 0;
      acc.discountAmount += record.discountAmount ?? 0;
      acc.transactionCount += 1;
      return acc;
    },
    { netAmount: 0, discountAmount: 0, transactionCount: 0 }
  );

  const activeCampaigns = mockData.campaigns.filter(campaign => campaign.status === 'ACTIVE');
  const runningCampaignSpend = activeCampaigns.reduce(
    (acc, campaign) => acc + (campaign.actualCost ?? 0),
    0
  );

  return {
    totalStudents,
    newStudentsThisMonth,
    totalRevenue: revenueTotals.netAmount,
    totalDiscount: revenueTotals.discountAmount,
    transactionCount: revenueTotals.transactionCount,
    activeCampaigns: activeCampaigns.length,
    activeCampaignSpend: runningCampaignSpend
  };
};

export const reportService = {
  getOverviewTimeseries: async (options = {}) => {
    const { startDate, endDate } = options;

    await delay();

    const series = filterTimeseries(
      mockData.marketingAnalytics.overviewTimeseries ?? [],
      startDate,
      endDate
    );

    return mockApiResponse(series);
  },

  getRoiSummary: async () => {
    await delay();
    return mockApiResponse(mockData.marketingAnalytics.roiSummary ?? null);
  },

  getChannelPerformance: async (options = {}) => {
    const { month, top = 5, sortBy = 'roi' } = options;

    await delay();

    let performance = mockData.marketingAnalytics.channelPerformance ?? [];

    if (month) {
      performance = performance.filter(entry => entry.month === month);
    }

    performance = sortByValue(performance, sortBy, 'desc').slice(0, top);
    return mockApiResponse(performance);
  },

  getCampaignRankings: async (options = {}) => {
    const { metric = 'byRevenue', limit = 5 } = options;

    await delay();

    const rankings = mockData.marketingAnalytics.campaignRankings ?? {};
    const selected = rankings[metric] ?? [];

    const enriched = selected
      .map(item => {
        const campaign = mockData.campaigns.find(c => c.id === item.campaignId);
        return {
          ...item,
          campaignName: campaign?.name ?? 'Unknown campaign',
          status: campaign?.status ?? null
        };
      })
      .slice(0, limit);

    return mockApiResponse(enriched);
  },

  getLeadSources: async () => {
    await delay();
    return mockApiResponse(mockData.marketingAnalytics.leadSources ?? []);
  },

  getConversionFunnel: async () => {
    await delay();
    return mockApiResponse(mockData.marketingAnalytics.conversionFunnel ?? null);
  },

  getDashboardSnapshot: async () => {
    await delay();

    const roiSummary = mockData.marketingAnalytics.roiSummary ?? null;

    const channelHighlights = sortByValue(
      mockData.marketingAnalytics.channelPerformance ?? [],
      'roi',
      'desc'
    ).slice(0, 3);

    const topCampaignEntries = (mockData.marketingAnalytics.campaignRankings?.byRoi ?? [])
      .slice(0, 3)
      .map(item => {
        const campaign = mockData.campaigns.find(c => c.id === item.campaignId);
        return {
          ...item,
          campaignName: campaign?.name ?? 'Unknown campaign',
          status: campaign?.status ?? null
        };
      });

    return mockApiResponse({
      snapshot: calculateSnapshot(),
      roiSummary,
      channelHighlights,
      topCampaigns: topCampaignEntries
    });
  }
};
