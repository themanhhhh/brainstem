import { mockData, mockApiResponse, paginateData } from '../../data/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));
const normalize = value => (value ?? '').toString().toLowerCase();
const toNumber = value => (value === undefined || value === null || value === '') ? undefined : Number(value);

const enrichStaff = staff => {
  const campaigns = mockData.campaigns.filter(campaign =>
    Array.isArray(staff.assignedCampaignIds) && staff.assignedCampaignIds.includes(campaign.id)
  );

  return {
    ...staff,
    campaigns: campaigns.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      startDate: campaign.startDate,
      endDate: campaign.endDate
    }))
  };
};

const sortStaff = (staffMembers, sortBy = 'fullName', sortDirection = 'asc') => {
  const direction = sortDirection === 'desc' ? -1 : 1;

  const getValue = staff => {
    switch (sortBy) {
      case 'hiredAt':
        return new Date(staff.hiredAt ?? 0).getTime();
      case 'kpiScore':
        return staff.kpiScore ?? 0;
      case 'role':
        return normalize(staff.role);
      case 'status':
        return normalize(staff.status);
      default:
        return normalize(staff.fullName);
    }
  };

  return [...staffMembers].sort((a, b) => {
    const valueA = getValue(a);
    const valueB = getValue(b);

    if (valueA < valueB) return -1 * direction;
    if (valueA > valueB) return 1 * direction;
    return 0;
  });
};

export const staffService = {
  getStaffMembers: async (options = {}) => {
    const {
      page = 0,
      size = 20,
      search = '',
      role,
      status,
      department,
      campaignId,
      sortBy,
      sortDirection
    } = options;

    await delay();

    const searchTerm = normalize(search).trim();
    const campaignFilter = toNumber(campaignId);

    let staffMembers = mockData.staffMembers.map(enrichStaff);

    if (searchTerm) {
      staffMembers = staffMembers.filter(member => {
        const values = [
          member.fullName,
          member.email,
          member.phoneNumber,
          member.employeeCode
        ];

        return values.some(value => normalize(value).includes(searchTerm));
      });
    }

    if (role) {
      staffMembers = staffMembers.filter(member => member.role === role);
    }

    if (status) {
      staffMembers = staffMembers.filter(member => member.status === status);
    }

    if (department) {
      staffMembers = staffMembers.filter(member => member.department === department);
    }

    if (campaignFilter !== undefined) {
      staffMembers = staffMembers.filter(member =>
        Array.isArray(member.assignedCampaignIds) &&
        member.assignedCampaignIds.includes(campaignFilter)
      );
    }

    staffMembers = sortStaff(staffMembers, sortBy, sortDirection);

    const result = paginateData(staffMembers, page, size);
    return mockApiResponse(result.data, result.metadata);
  },

  getStaffSummary: async () => {
    await delay();

    const totals = mockData.staffMembers.reduce(
      (acc, member) => {
        acc.total += 1;
        acc.byRole[member.role] = (acc.byRole[member.role] ?? 0) + 1;
        acc.byStatus[member.status] = (acc.byStatus[member.status] ?? 0) + 1;

        const workload = Array.isArray(member.assignedCampaignIds)
          ? member.assignedCampaignIds.length
          : 0;

        acc.maxWorkload = Math.max(acc.maxWorkload, workload);
        acc.totalAssignments += workload;

        return acc;
      },
      {
        total: 0,
        byRole: {},
        byStatus: {},
        totalAssignments: 0,
        maxWorkload: 0
      }
    );

    const averageAssignments = totals.total
      ? Number((totals.totalAssignments / totals.total).toFixed(2))
      : 0;

    const topPerformers = [...mockData.staffMembers]
      .sort((a, b) => (b.kpiScore ?? 0) - (a.kpiScore ?? 0))
      .slice(0, 3)
      .map(enrichStaff);

    return mockApiResponse({
      total: totals.total,
      byRole: totals.byRole,
      byStatus: totals.byStatus,
      totalAssignments: totals.totalAssignments,
      averageAssignments,
      maxWorkload: totals.maxWorkload,
      topPerformers
    });
  },

  getStaffById: async id => {
    await delay();

    const numericId = Number(id);
    const member = mockData.staffMembers.find(item => item.id === numericId);

    if (!member) {
      return mockApiResponse(null, null);
    }

    return mockApiResponse(enrichStaff(member));
  },

  addStaffMember: async staff => {
    await delay(500);

    const ids = mockData.staffMembers.map(item => item.id);
    const nextId = ids.length ? Math.max(...ids) + 1 : 1;

    const newStaffMember = {
      id: nextId,
      employeeCode: staff.employeeCode || `EMP-${nextId.toString().padStart(4, '0')}`,
      fullName: staff.fullName,
      email: staff.email,
      phoneNumber: staff.phoneNumber,
      role: staff.role,
      department: staff.department,
      status: staff.status || 'ACTIVE',
      hiredAt: staff.hiredAt || new Date().toISOString(),
      assignedCampaignIds: Array.isArray(staff.assignedCampaignIds)
        ? staff.assignedCampaignIds
        : [],
      skills: Array.isArray(staff.skills) ? staff.skills : [],
      kpiScore: staff.kpiScore ?? 0
    };

    mockData.staffMembers.push(newStaffMember);
    return mockApiResponse(enrichStaff(newStaffMember));
  },

  updateStaffMember: async (id, updates) => {
    await delay(500);

    const numericId = Number(id);
    const index = mockData.staffMembers.findIndex(item => item.id === numericId);

    if (index === -1) {
      throw new Error('Staff member not found');
    }

    mockData.staffMembers[index] = {
      ...mockData.staffMembers[index],
      ...updates,
      assignedCampaignIds: Array.isArray(updates.assignedCampaignIds)
        ? updates.assignedCampaignIds
        : mockData.staffMembers[index].assignedCampaignIds,
      skills: Array.isArray(updates.skills)
        ? updates.skills
        : mockData.staffMembers[index].skills
    };

    return mockApiResponse(enrichStaff(mockData.staffMembers[index]));
  },

  deleteStaffMember: async id => {
    await delay(500);

    const numericId = Number(id);
    const index = mockData.staffMembers.findIndex(item => item.id === numericId);

    if (index === -1) {
      throw new Error('Staff member not found');
    }

    const [deletedMember] = mockData.staffMembers.splice(index, 1);
    return mockApiResponse(enrichStaff(deletedMember));
  },

  assignCampaign: async (staffId, campaignId, assign = true) => {
    await delay(400);

    const numericStaffId = Number(staffId);
    const numericCampaignId = Number(campaignId);

    const staffIndex = mockData.staffMembers.findIndex(item => item.id === numericStaffId);

    if (staffIndex === -1) {
      throw new Error('Staff member not found');
    }

    const campaign = mockData.campaigns.find(item => item.id === numericCampaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const currentAssignments = Array.isArray(mockData.staffMembers[staffIndex].assignedCampaignIds)
      ? [...mockData.staffMembers[staffIndex].assignedCampaignIds]
      : [];

    const alreadyAssigned = currentAssignments.includes(numericCampaignId);

    let updatedAssignments = currentAssignments;

    if (assign && !alreadyAssigned) {
      updatedAssignments = [...currentAssignments, numericCampaignId];
    }

    if (!assign && alreadyAssigned) {
      updatedAssignments = currentAssignments.filter(id => id !== numericCampaignId);
    }

    mockData.staffMembers[staffIndex] = {
      ...mockData.staffMembers[staffIndex],
      assignedCampaignIds: updatedAssignments
    };

    return mockApiResponse(enrichStaff(mockData.staffMembers[staffIndex]));
  }
};
