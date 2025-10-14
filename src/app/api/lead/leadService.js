import { mockData, mockApiResponse, paginateData } from '../../data/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));
const normalize = value => (value ?? '').toString().toLowerCase();
const toNumber = value => (value === undefined || value === null || value === '') ? undefined : Number(value);

const enrichLead = lead => {
  const campaign = mockData.campaigns.find(item => item.id === lead.campaignId) || null;
  const channel = mockData.channels.find(item => item.id === lead.channelId) || null;
  const staff = mockData.staffMembers.find(item => item.id === lead.assignedStaffId) || null;
  const student = lead.convertedStudentId
    ? mockData.students.find(item => item.id === lead.convertedStudentId) || null
    : null;

  return {
    ...lead,
    campaignName: campaign?.name ?? null,
    channelName: channel?.name ?? null,
    assignedStaffName: staff?.fullName ?? null,
    convertedStudentName: student?.fullName ?? null
  };
};

const sortLeads = (leads, sortBy = 'createdAt', sortDirection = 'desc') => {
  const direction = sortDirection === 'asc' ? 1 : -1;

  const valueOf = lead => {
    switch (sortBy) {
      case 'lastContactAt':
        return new Date(lead.lastContactAt ?? 0).getTime();
      case 'status':
        return normalize(lead.status);
      case 'interestLevel':
        return normalize(lead.interestLevel);
      case 'fullName':
        return normalize(lead.fullName);
      default:
        return new Date(lead.createdAt ?? 0).getTime();
    }
  };

  return [...leads].sort((a, b) => {
    const valueA = valueOf(a);
    const valueB = valueOf(b);

    if (valueA < valueB) return -1 * direction;
    if (valueA > valueB) return 1 * direction;
    return 0;
  });
};

export const leadService = {
  getLeads: async (options = {}) => {
    const {
      page = 0,
      size = 20,
      search = '',
      status,
      interestLevel,
      campaignId,
      channelId,
      assignedStaffId,
      tags = [],
      sortBy,
      sortDirection
    } = options;

    await delay();

    const searchTerm = normalize(search).trim();
    const campaignFilter = toNumber(campaignId);
    const channelFilter = toNumber(channelId);
    const staffFilter = toNumber(assignedStaffId);
    const tagFilters = Array.isArray(tags)
      ? tags.map(tag => normalize(tag)).filter(Boolean)
      : [];

    let leads = mockData.potentialStudents.map(enrichLead);

    if (searchTerm) {
      leads = leads.filter(lead => {
        const values = [
          lead.fullName,
          lead.email,
          lead.phoneNumber,
          lead.leadSource,
          lead.notes
        ];

        return values.some(value => normalize(value).includes(searchTerm));
      });
    }

    if (status) {
      leads = leads.filter(lead => lead.status === status);
    }

    if (interestLevel) {
      leads = leads.filter(lead => lead.interestLevel === interestLevel);
    }

    if (campaignFilter !== undefined) {
      leads = leads.filter(lead => lead.campaignId === campaignFilter);
    }

    if (channelFilter !== undefined) {
      leads = leads.filter(lead => lead.channelId === channelFilter);
    }

    if (staffFilter !== undefined) {
      leads = leads.filter(lead => lead.assignedStaffId === staffFilter);
    }

    if (tagFilters.length) {
      leads = leads.filter(lead => {
        const leadTags = Array.isArray(lead.tags) ? lead.tags.map(normalize) : [];
        return tagFilters.every(tag => leadTags.includes(tag));
      });
    }

    leads = sortLeads(leads, sortBy, sortDirection);

    const result = paginateData(leads, page, size);
    return mockApiResponse(result.data, result.metadata);
  },

  getLeadSummary: async () => {
    await delay();

    const statusCounts = mockData.marketingEnums.potentialStudentStatuses.reduce(
      (acc, status) => ({ ...acc, [status]: 0 }),
      {}
    );

    const interestCounts = mockData.marketingEnums.interestLevels.reduce(
      (acc, level) => ({ ...acc, [level]: 0 }),
      {}
    );

    const channelBreakdown = new Map();
    const campaignBreakdown = new Map();

    mockData.potentialStudents.forEach(lead => {
      statusCounts[lead.status] = (statusCounts[lead.status] ?? 0) + 1;
      interestCounts[lead.interestLevel] = (interestCounts[lead.interestLevel] ?? 0) + 1;

      if (lead.channelId) {
        const channel = mockData.channels.find(item => item.id === lead.channelId);
        const channelEntry = channelBreakdown.get(lead.channelId) ?? {
          channelId: lead.channelId,
          channelName: channel?.name ?? 'Unknown channel',
          leadCount: 0,
          convertedCount: 0
        };

        channelEntry.leadCount += 1;
        if (lead.status === 'REGISTERED') {
          channelEntry.convertedCount += 1;
        }

        channelBreakdown.set(lead.channelId, channelEntry);
      }

      if (lead.campaignId) {
        const campaign = mockData.campaigns.find(item => item.id === lead.campaignId);
        const campaignEntry = campaignBreakdown.get(lead.campaignId) ?? {
          campaignId: lead.campaignId,
          campaignName: campaign?.name ?? 'Unknown campaign',
          leadCount: 0,
          convertedCount: 0
        };

        campaignEntry.leadCount += 1;
        if (lead.status === 'REGISTERED') {
          campaignEntry.convertedCount += 1;
        }

        campaignBreakdown.set(lead.campaignId, campaignEntry);
      }
    });

    return mockApiResponse({
      total: mockData.potentialStudents.length,
      statusCounts,
      interestCounts,
      channelBreakdown: Array.from(channelBreakdown.values()).sort(
        (a, b) => b.leadCount - a.leadCount
      ),
      campaignBreakdown: Array.from(campaignBreakdown.values()).sort(
        (a, b) => b.leadCount - a.leadCount
      )
    });
  },

  getLeadById: async id => {
    await delay();

    const numericId = Number(id);
    const lead = mockData.potentialStudents.find(item => item.id === numericId);

    if (!lead) {
      return mockApiResponse(null, null);
    }

    return mockApiResponse(enrichLead(lead));
  },

  addLead: async lead => {
    await delay(500);

    const ids = mockData.potentialStudents.map(item => item.id);
    const nextId = ids.length ? Math.max(...ids) + 1 : 1;

    const now = new Date().toISOString();

    const newLead = {
      id: nextId,
      fullName: lead.fullName,
      email: lead.email,
      phoneNumber: lead.phoneNumber,
      status: lead.status || 'TRIAL',
      interestLevel: lead.interestLevel || 'MEDIUM',
      channelId: lead.channelId ?? null,
      campaignId: lead.campaignId ?? null,
      leadSource: lead.leadSource ?? null,
      tags: Array.isArray(lead.tags) ? lead.tags : [],
      assignedStaffId: lead.assignedStaffId ?? null,
      lastContactAt: lead.lastContactAt || now,
      convertedStudentId: lead.convertedStudentId ?? null,
      createdAt: lead.createdAt || now,
      updatedAt: lead.updatedAt || now,
      notes: lead.notes ?? null
    };

    mockData.potentialStudents.push(newLead);
    return mockApiResponse(enrichLead(newLead));
  },

  updateLead: async (id, updates) => {
    await delay(500);

    const numericId = Number(id);
    const index = mockData.potentialStudents.findIndex(item => item.id === numericId);

    if (index === -1) {
      throw new Error('Lead not found');
    }

    mockData.potentialStudents[index] = {
      ...mockData.potentialStudents[index],
      ...updates,
      updatedAt: updates.updatedAt || new Date().toISOString()
    };

    return mockApiResponse(enrichLead(mockData.potentialStudents[index]));
  },

  deleteLead: async id => {
    await delay(500);

    const numericId = Number(id);
    const index = mockData.potentialStudents.findIndex(item => item.id === numericId);

    if (index === -1) {
      throw new Error('Lead not found');
    }

    const [deletedLead] = mockData.potentialStudents.splice(index, 1);
    return mockApiResponse(enrichLead(deletedLead));
  },

  convertLead: async (id, { studentId = null, status = 'REGISTERED' } = {}) => {
    await delay(400);

    const numericId = Number(id);
    const index = mockData.potentialStudents.findIndex(item => item.id === numericId);

    if (index === -1) {
      throw new Error('Lead not found');
    }

    mockData.potentialStudents[index] = {
      ...mockData.potentialStudents[index],
      status,
      convertedStudentId: studentId,
      updatedAt: new Date().toISOString()
    };

    return mockApiResponse(enrichLead(mockData.potentialStudents[index]));
  }
};
