import { useState, useEffect } from 'react';
import API from '../../../../api//axios';

function Reports({ students, records }) {
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/overview');
      setSummary(res.data.data || {});
    } catch (err) {
      console.error('Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const rows = [
      ['Total Students', summary.totalStudents || 0],
      ['Total Teachers', summary.totalTeachers || 0],
      ['Pending Enrollments', summary.pendingEnrollments || 0],
      ['Today Attendance', summary.todayAttendance || 0]
    ];

    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `summary_report_${new Date().toLocaleDateString()}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {[
          {
            label: 'Total Students',
            value: summary.totalStudents || 0,
            icon: '👨‍🎓',
            color: 'bg-blue-50 text-blue-600'
          },
          {
            label: 'Total Teachers',
            value: summary.totalTeachers || 0,
            icon: '👨‍🏫',
            color: 'bg-indigo-50 text-indigo-600'
          },
          {
            label: 'Pending Enrollments',
            value: summary.pendingEnrollments || 0,
            icon: '⏳',
            color: 'bg-yellow-50 text-yellow-600'
          }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-500 text-xs font-medium uppercase">{stat.label}</p>
              <span className={`text-xl p-2 rounded-xl ${stat.color}`}>
                {stat.icon}
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Today Attendance Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-gray-600 font-medium">Today Attendance</h2>
          <span className="text-2xl">📅</span>
        </div>

        <p className="text-4xl font-bold text-green-600">
          {summary.todayAttendance || 0}
        </p>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition"
        >
          📥 Export Summary Report
        </button>
      </div>

    </div>
  );
}

export default Reports;