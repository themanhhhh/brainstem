import { mockData, mockApiResponse, paginateData } from '../../data/mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const normalize = value => (value ?? '').toString().toLowerCase();
const toNumber = value => (value === undefined || value === null || value === '') ? undefined : Number(value);

const enrichStudent = student => {
  const campaign = mockData.campaigns.find(item => item.id === student.campaignId) || null;
  const channel = mockData.channels.find(item => item.id === student.channelId) || null;
  const staff = mockData.staffMembers.find(item => item.id === student.assignedStaffId) || null;

  return {
    ...student,
    campaignName: campaign?.name ?? null,
    channelName: channel?.name ?? null,
    assignedStaffName: staff?.fullName ?? null
  };
};

const sortStudents = (students, sortBy = 'enrollmentDate', sortDirection = 'desc') => {
  const direction = sortDirection === 'asc' ? 1 : -1;

  const getValue = student => {
    switch (sortBy) {
      case 'tuitionFee':
        return student.tuitionFee ?? 0;
      case 'paidAmount':
        return student.paidAmount ?? 0;
      case 'outstandingAmount':
        return student.outstandingAmount ?? 0;
      case 'studentCode':
        return normalize(student.studentCode);
      case 'fullName':
        return normalize(student.fullName);
      default:
        return new Date(student.enrollmentDate ?? 0).getTime();
    }
  };

  return [...students].sort((a, b) => {
    const valueA = getValue(a);
    const valueB = getValue(b);

    if (valueA < valueB) return -1 * direction;
    if (valueA > valueB) return 1 * direction;
    return 0;
  });
};

export const studentService = {
  getStudents: async (options = {}) => {
    const {
      page = 0,
      size = 20,
      search = '',
      status,
      enrollmentStatus,
      campaignId,
      channelId,
      assignedStaffId,
      newStudent,
      sortBy,
      sortDirection
    } = options;

    await delay();

    const searchTerm = normalize(search).trim();
    const campaignFilter = toNumber(campaignId);
    const channelFilter = toNumber(channelId);
    const staffFilter = toNumber(assignedStaffId);

    let students = mockData.students.map(enrichStudent);

    if (searchTerm) {
      students = students.filter(student => {
        const values = [
          student.fullName,
          student.email,
          student.phoneNumber,
          student.studentCode,
          student.notes
        ];

        return values.some(value => normalize(value).includes(searchTerm));
      });
    }

    if (status) {
      students = students.filter(student => student.status === status);
    }

    if (enrollmentStatus) {
      students = students.filter(student => student.enrollmentStatus === enrollmentStatus);
    }

    if (campaignFilter !== undefined) {
      students = students.filter(student => student.campaignId === campaignFilter);
    }

    if (channelFilter !== undefined) {
      students = students.filter(student => student.channelId === channelFilter);
    }

    if (staffFilter !== undefined) {
      students = students.filter(student => student.assignedStaffId === staffFilter);
    }

    if (typeof newStudent === 'boolean') {
      students = students.filter(student => student.newStudent === newStudent);
    }

    students = sortStudents(students, sortBy, sortDirection);

    const result = paginateData(students, page, size);
    return mockApiResponse(result.data, result.metadata);
  },

  getStudentSummary: async () => {
    await delay();

    const totals = mockData.students.reduce(
      (acc, student) => {
        acc.total += 1;
        acc.outstandingAmount += student.outstandingAmount ?? 0;

        if (student.status === 'ACTIVE') acc.active += 1;
        if (student.status === 'ON_HOLD') acc.onHold += 1;
        if (student.status === 'GRADUATED') acc.graduated += 1;
        if (student.newStudent) acc.newStudents += 1;

        return acc;
      },
      { total: 0, active: 0, onHold: 0, graduated: 0, newStudents: 0, outstandingAmount: 0 }
    );

    const campaignBreakdownMap = new Map();
    mockData.students.forEach(student => {
      if (!student.campaignId) return;
      if (!campaignBreakdownMap.has(student.campaignId)) {
        const campaign = mockData.campaigns.find(item => item.id === student.campaignId);
        campaignBreakdownMap.set(student.campaignId, {
          campaignId: student.campaignId,
          campaignName: campaign?.name ?? 'Unknown campaign',
          studentCount: 0,
          revenue: 0
        });
      }

      const entry = campaignBreakdownMap.get(student.campaignId);
      entry.studentCount += 1;
    });

    mockData.revenueRecords.forEach(record => {
      if (!record.campaignId) return;
      const entry = campaignBreakdownMap.get(record.campaignId);
      if (entry) {
        entry.revenue += record.netAmount ?? 0;
      }
    });

    const campaignBreakdown = Array.from(campaignBreakdownMap.values()).sort(
      (a, b) => b.studentCount - a.studentCount
    );

    return mockApiResponse({
      ...totals,
      campaignBreakdown
    });
  },

  getStudentById: async id => {
    await delay();

    const numericId = Number(id);
    const student = mockData.students.find(item => item.id === numericId);

    if (!student) {
      return mockApiResponse(null, null);
    }

    return mockApiResponse(enrichStudent(student));
  },

  addStudent: async student => {
    await delay(500);

    const ids = mockData.students.map(item => item.id);
    const nextId = ids.length ? Math.max(...ids) + 1 : 1;

    const newStudent = {
      id: nextId,
      studentCode: student.studentCode || `STU-${nextId.toString().padStart(4, '0')}`,
      fullName: student.fullName,
      email: student.email,
      phoneNumber: student.phoneNumber,
      status: student.status || 'ACTIVE',
      enrollmentStatus: student.enrollmentStatus || 'ENROLLED',
      courseId: student.courseId ?? null,
      courseName: student.courseName ?? null,
      campaignId: student.campaignId ?? null,
      channelId: student.channelId ?? null,
      assignedStaffId: student.assignedStaffId ?? null,
      enrollmentDate: student.enrollmentDate || new Date().toISOString(),
      graduationDate: student.graduationDate ?? null,
      tuitionFee: student.tuitionFee ?? 0,
      paidAmount: student.paidAmount ?? 0,
      outstandingAmount: student.outstandingAmount ?? 0,
      newStudent: Boolean(student.newStudent),
      notes: student.notes ?? null
    };

    mockData.students.push(newStudent);

    return mockApiResponse(enrichStudent(newStudent));
  },

  updateStudent: async (id, updates) => {
    await delay(500);

    const numericId = Number(id);
    const index = mockData.students.findIndex(item => item.id === numericId);

    if (index === -1) {
      throw new Error('Student not found');
    }

    mockData.students[index] = {
      ...mockData.students[index],
      ...updates
    };

    return mockApiResponse(enrichStudent(mockData.students[index]));
  },

  deleteStudent: async id => {
    await delay(500);

    const numericId = Number(id);
    const index = mockData.students.findIndex(item => item.id === numericId);

    if (index === -1) {
      throw new Error('Student not found');
    }

    const [deletedStudent] = mockData.students.splice(index, 1);
    return mockApiResponse(enrichStudent(deletedStudent));
  }
};
