import { mockData, mockApiResponse, paginateData } from '../../data/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));
const normalize = value => (value ?? '').toString().toLowerCase();
const toNumber = value => (value === undefined || value === null || value === '') ? undefined : Number(value);
const parseDate = value => (value ? new Date(value).getTime() : null);

const enrichRecord = record => {
  const student = mockData.students.find(item => item.id === record.studentId) || null;
  const campaign = record.campaignId
    ? mockData.campaigns.find(item => item.id === record.campaignId) || null
    : null;
  const channel = record.channelId
    ? mockData.channels.find(item => item.id === record.channelId) || null
    : null;
  const staff = record.recordedByStaffId
    ? mockData.staffMembers.find(item => item.id === record.recordedByStaffId) || null
    : null;

  return {
    ...record,
    studentName: student?.fullName ?? null,
    campaignName: campaign?.name ?? null,
    channelName: channel?.name ?? null,
    recordedByName: staff?.fullName ?? null
  };
};

const sortRecords = (records, sortBy = 'paymentDate', sortDirection = 'desc') => {
  const direction = sortDirection === 'asc' ? 1 : -1;

  const getValue = record => {
    switch (sortBy) {
      case 'netAmount':
        return record.netAmount ?? 0;
      case 'discountAmount':
        return record.discountAmount ?? 0;
      case 'studentName':
        return normalize(record.studentName);
      default:
        return parseDate(record.paymentDate) ?? 0;
    }
  };

  return [...records].sort((a, b) => {
    const valueA = getValue(a);
    const valueB = getValue(b);

    if (valueA < valueB) return -1 * direction;
    if (valueA > valueB) return 1 * direction;
    return 0;
  });
};

export const revenueService = {
  getRevenueRecords: async (options = {}) => {
    const {
      page = 0,
      size = 20,
      search = '',
      campaignId,
      channelId,
      studentId,
      paymentMethod,
      startDate,
      endDate,
      sortBy,
      sortDirection
    } = options;

    await delay();

    const searchTerm = normalize(search).trim();
    const campaignFilter = toNumber(campaignId);
    const channelFilter = toNumber(channelId);
    const studentFilter = toNumber(studentId);
    const fromDate = parseDate(startDate);
    const toDate = parseDate(endDate);

    let records = mockData.revenueRecords.map(enrichRecord);

    if (searchTerm) {
      records = records.filter(record =>
        [
          record.receiptNumber,
          record.studentName,
          record.campaignName,
          record.channelName,
          record.paymentMethod,
          record.notes
        ]
          .map(normalize)
          .some(value => value.includes(searchTerm))
      );
    }

    if (campaignFilter !== undefined) {
      records = records.filter(record => record.campaignId === campaignFilter);
    }

    if (channelFilter !== undefined) {
      records = records.filter(record => record.channelId === channelFilter);
    }

    if (studentFilter !== undefined) {
      records = records.filter(record => record.studentId === studentFilter);
    }

    if (paymentMethod) {
      records = records.filter(record => record.paymentMethod === paymentMethod);
    }

    if (fromDate || toDate) {
      records = records.filter(record => {
        const paymentDate = parseDate(record.paymentDate);
        if (fromDate && paymentDate < fromDate) return false;
        if (toDate && paymentDate > toDate) return false;
        return true;
      });
    }

    records = sortRecords(records, sortBy, sortDirection);

    const result = paginateData(records, page, size);
    return mockApiResponse(result.data, result.metadata);
  },

  getRevenueSummary: async (options = {}) => {
    const {
      campaignId,
      channelId,
      startDate,
      endDate
    } = options;

    await delay();

    const campaignFilter = toNumber(campaignId);
    const channelFilter = toNumber(channelId);
    const fromDate = parseDate(startDate);
    const toDate = parseDate(endDate);

    const filtered = mockData.revenueRecords.filter(record => {
      if (campaignFilter !== undefined && record.campaignId !== campaignFilter) return false;
      if (channelFilter !== undefined && record.channelId !== channelFilter) return false;

      const paymentDate = parseDate(record.paymentDate);
      if (fromDate && paymentDate < fromDate) return false;
      if (toDate && paymentDate > toDate) return false;
      return true;
    });

    const totals = filtered.reduce(
      (acc, record) => {
        acc.transactionCount += 1;
        acc.totalAmount += record.amount ?? 0;
        acc.totalDiscount += record.discountAmount ?? 0;
        acc.netAmount += record.netAmount ?? 0;
        if (record.campaignId) acc.linkedToCampaign += 1;
        if (record.channelId) acc.linkedToChannel += 1;
        return acc;
      },
      {
        transactionCount: 0,
        totalAmount: 0,
        totalDiscount: 0,
        netAmount: 0,
        linkedToCampaign: 0,
        linkedToChannel: 0
      }
    );

    const byCampaign = new Map();
    filtered.forEach(record => {
      if (!record.campaignId) return;
      const campaign = mockData.campaigns.find(item => item.id === record.campaignId);
      const entry = byCampaign.get(record.campaignId) ?? {
        campaignId: record.campaignId,
        campaignName: campaign?.name ?? 'Unknown campaign',
        netAmount: 0,
        transactionCount: 0
      };

      entry.netAmount += record.netAmount ?? 0;
      entry.transactionCount += 1;
      byCampaign.set(record.campaignId, entry);
    });

    const byChannel = new Map();
    filtered.forEach(record => {
      if (!record.channelId) return;
      const channel = mockData.channels.find(item => item.id === record.channelId);
      const entry = byChannel.get(record.channelId) ?? {
        channelId: record.channelId,
        channelName: channel?.name ?? 'Unknown channel',
        netAmount: 0,
        transactionCount: 0
      };

      entry.netAmount += record.netAmount ?? 0;
      entry.transactionCount += 1;
      byChannel.set(record.channelId, entry);
    });

    const byPaymentMethod = new Map();
    filtered.forEach(record => {
      const method = record.paymentMethod ?? 'UNKNOWN';
      const entry = byPaymentMethod.get(method) ?? {
        paymentMethod: method,
        netAmount: 0,
        transactionCount: 0
      };

      entry.netAmount += record.netAmount ?? 0;
      entry.transactionCount += 1;
      byPaymentMethod.set(method, entry);
    });

    return mockApiResponse({
      totals,
      byCampaign: Array.from(byCampaign.values()).sort((a, b) => b.netAmount - a.netAmount),
      byChannel: Array.from(byChannel.values()).sort((a, b) => b.netAmount - a.netAmount),
      byPaymentMethod: Array.from(byPaymentMethod.values()).sort(
        (a, b) => b.netAmount - a.netAmount
      )
    });
  },

  getRevenueRecordById: async id => {
    await delay();

    const numericId = Number(id);
    const record = mockData.revenueRecords.find(item => item.id === numericId);

    if (!record) {
      return mockApiResponse(null, null);
    }

    return mockApiResponse(enrichRecord(record));
  },

  addRevenueRecord: async record => {
    await delay(500);

    const ids = mockData.revenueRecords.map(item => item.id);
    const nextId = ids.length ? Math.max(...ids) + 1 : 1;

    const newRecord = {
      id: nextId,
      receiptNumber: record.receiptNumber || `RCV-${new Date().getFullYear()}-${nextId.toString().padStart(4, '0')}`,
      studentId: record.studentId,
      campaignId: record.campaignId ?? null,
      channelId: record.channelId ?? null,
      amount: record.amount ?? 0,
      discountAmount: record.discountAmount ?? 0,
      netAmount: record.netAmount ?? (record.amount ?? 0) - (record.discountAmount ?? 0),
      paymentMethod: record.paymentMethod || 'BANK_TRANSFER',
      paymentDate: record.paymentDate || new Date().toISOString(),
      recordedByStaffId: record.recordedByStaffId ?? null,
      notes: record.notes ?? null
    };

    mockData.revenueRecords.push(newRecord);
    return mockApiResponse(enrichRecord(newRecord));
  },

  updateRevenueRecord: async (id, updates) => {
    await delay(500);

    const numericId = Number(id);
    const index = mockData.revenueRecords.findIndex(item => item.id === numericId);

    if (index === -1) {
      throw new Error('Revenue record not found');
    }

    const merged = {
      ...mockData.revenueRecords[index],
      ...updates
    };

    if (updates.amount !== undefined || updates.discountAmount !== undefined) {
      const amount = merged.amount ?? 0;
      const discount = merged.discountAmount ?? 0;
      merged.netAmount = updates.netAmount ?? amount - discount;
    }

    mockData.revenueRecords[index] = merged;
    return mockApiResponse(enrichRecord(mockData.revenueRecords[index]));
  },

  deleteRevenueRecord: async id => {
    await delay(500);

    const numericId = Number(id);
    const index = mockData.revenueRecords.findIndex(item => item.id === numericId);

    if (index === -1) {
      throw new Error('Revenue record not found');
    }

    const [deleted] = mockData.revenueRecords.splice(index, 1);
    return mockApiResponse(enrichRecord(deleted));
  }
};
