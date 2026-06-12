// src/pages/teacher/tabs/ReportsTab.jsx
import { useState, useEffect } from 'react';
import API from '../../../../api/axios';

export default function ReportsTab({ students, records }) {

  const [subjectFilter, setSubjectFilter] = useState('all');
  const [subjects,      setSubjects]      = useState([]);
  const [search,        setSearch]        = useState('');
  const [sortBy,        setSortBy]        = useState('name');

  // Extract unique subjects from records
  useEffect(() => {
    const uniqueSubjects = [];
    const seen = new Set();
    records.forEach(r => {
      if (r.subject?._id && !seen.has(r.subject._id)) {
        seen.add(r.subject._id);
        uniqueSubjects.push(r.subject);
      }
    });
    setSubjects(uniqueSubjects);
  }, [records]);

  // ── CALCULATE PER-STUDENT STATS ────────────────────────────────
  const studentStats = students.map(student => {
    const studentRecords = records.filter(r =>
      (r.student?._id === student._id || r.student === student._id) &&
      (subjectFilter === 'all' || r.subject?._id === subjectFilter)
    );

    const present    = studentRecords.filter(r => r.status === 'present').length;
    const absent     = studentRecords.filter(r => r.status === 'absent').length;
    const late       = studentRecords.filter(r => r.status === 'late').length;
    const total      = studentRecords.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { ...student, present, absent, late, total, percentage };
  });

  // ── FILTER AND SORT ────────────────────────────────────────────
  const filtered = studentStats
    .filter(s =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name')       return a.name?.localeCompare(b.name);
      if (sortBy === 'percentage') return a.percentage - b.percentage;
      if (sortBy === 'present')    return b.present - a.present;
      return 0;
    });

  const lowAttendance  = filtered.filter(s => s.percentage < 75 && s.total > 0);
  const goodAttendance = filtered.filter(s => s.percentage >= 75);
  const notMarked      = filtered.filter(s => s.total === 0);

  // ── OVERALL STATS ──────────────────────────────────────────────
  const totalStudents  = filtered.length;
  const avgPercentage  = filtered.length > 0
    ? Math.round(filtered.reduce((sum, s) => sum + s.percentage, 0) / filtered.length)
    : 0;
  const totalClasses   = filtered.reduce((sum, s) => sum + s.total, 0);
  const totalPresent   = filtered.reduce((sum, s) => sum + s.present, 0);

  // ── EXPORT CSV ─────────────────────────────────────────────────
  const handleExport = () => {
    const rows = [
      ['Student Name', 'Roll No', 'Department', 'Semester', 'Present', 'Absent', 'Late', 'Total Classes', 'Percentage', 'Status']
    ];
    filtered.forEach(s => {
      rows.push([
        s.name,
        s.rollNo    || '—',
        s.department || '—',
        s.semester  || '—',
        s.present,
        s.absent,
        s.late,
        s.total,
        `${s.percentage}%`,
        s.total === 0      ? 'No Data'  :
        s.percentage >= 75 ? 'Good'     :
        s.percentage >= 60 ? 'Warning'  : 'Critical'
      ]);
    });

    const csv  = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `report_${new Date().toLocaleDateString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── HELPERS ────────────────────────────────────────────────────
  const getPercentageColor = (pct, total) => {
    if (total === 0)  return 'text-gray-400';
    if (pct >= 75)    return 'text-green-600';
    if (pct >= 60)    return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBarColor = (pct, total) => {
    if (total === 0)  return 'bg-gray-200';
    if (pct >= 75)    return 'bg-green-500';
    if (pct >= 60)    return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (pct, total) => {
    if (total === 0)  return 'bg-gray-100 text-gray-500';
    if (pct >= 75)    return 'bg-green-100 text-green-700';
    if (pct >= 60)    return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getStatusLabel = (pct, total) => {
    if (total === 0)  return 'No Data';
    if (pct >= 75)    return 'Good';
    if (pct >= 60)    return 'Warning';
    return 'Critical';
  };

  return (
    <div className="space-y-6">

      {/* ── SUMMARY CARDS ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Students',
            value: totalStudents,
            icon:  '👨‍🎓',
            color: 'bg-blue-50 text-blue-600',
            border: 'border-blue-100'
          },
          {
            label: 'Avg Attendance',
            value: `${avgPercentage}%`,
            icon:  '📊',
            color: avgPercentage >= 75
              ? 'bg-green-50 text-green-600'
              : 'bg-yellow-50 text-yellow-600',
            border: avgPercentage >= 75 ? 'border-green-100' : 'border-yellow-100'
          },
          {
            label: 'Low Attendance',
            value: lowAttendance.length,
            icon:  '⚠️',
            color: 'bg-red-50 text-red-600',
            border: 'border-red-100'
          },
          {
            label: 'Good Attendance',
            value: goodAttendance.length,
            icon:  '✅',
            color: 'bg-green-50 text-green-600',
            border: 'border-green-100'
          }
        ].map((stat, i) => (
          <div key={i} className={`bg-white rounded-2xl p-5 shadow-sm border ${stat.border}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                {stat.label}
              </p>
              <span className={`text-2xl p-1.5 rounded-lg ${stat.color}`}>
                {stat.icon}
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── LOW ATTENDANCE ALERT ───────────────────────────────── */}
      {lowAttendance.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-red-100">
          <div className="p-5 border-b border-red-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"/>
              <h2 className="font-semibold text-gray-800">
                Low Attendance Alert
              </h2>
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                {lowAttendance.length} student{lowAttendance.length > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs text-gray-400">Below 75% threshold</p>
          </div>
          <div className="p-5 space-y-4">
            {lowAttendance.map((student, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 text-sm font-bold">
                    {student.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{student.name}</p>
                      <p className="text-xs text-gray-400">
                        {student.rollNo} • {student.present}/{student.total} classes attended
                      </p>
                    </div>
                    <span className={`text-sm font-bold ${getPercentageColor(student.percentage, student.total)}`}>
                      {student.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${getBarColor(student.percentage, student.total)}`}
                      style={{ width: `${student.percentage}%` }}
                    />
                  </div>
                  {/* 75% marker */}
                  <div className="relative h-0">
                    <div
                      className="absolute top-0 w-px h-2 bg-gray-400 -mt-2"
                      style={{ left: '75%' }}
                    />
                  </div>
                  <p className="text-xs text-red-400 mt-1">
                    Needs {Math.ceil((0.75 * student.total - student.present) / (1 - 0.75))} more classes to reach 75%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FILTERS AND EXPORT ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">

        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name or roll no..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Subject filter */}
        <select
          value={subjectFilter}
          onChange={e => setSubjectFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All Subjects</option>
          {subjects.map(s => (
            <option key={s._id} value={s._id}>{s.name} — {s.code}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="name">Sort by Name</option>
          <option value="percentage">Sort by Percentage</option>
          <option value="present">Sort by Present Count</option>
        </select>

        {/* Export */}
        <button
          onClick={handleExport}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* ── FULL REPORT TABLE ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-gray-800">
            Full Attendance Report
            <span className="text-gray-400 font-normal text-sm ml-2">
              ({filtered.length} students)
            </span>
          </h2>
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"/>Good ≥75%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"/>Warning 60–74%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full"/>Critical &lt;60%
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {['#', 'Student', 'Roll No', 'Present', 'Absent', 'Late', 'Total', 'Percentage', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">📊</span>
                      <p className="text-gray-500 font-medium">No data available</p>
                      <p className="text-gray-400 text-sm">
                        {search ? 'Try a different search term' : 'No students or records found'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((student, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition group">

                    {/* # */}
                    <td className="px-5 py-3 text-sm text-gray-400">
                      {i + 1}
                    </td>

                    {/* Student */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0
                          ${student.percentage < 60 && student.total > 0
                            ? 'bg-red-100'
                            : student.percentage < 75 && student.total > 0
                            ? 'bg-yellow-100'
                            : 'bg-green-100'}`}
                        >
                          <span className={`text-sm font-bold
                            ${student.percentage < 60 && student.total > 0
                              ? 'text-red-600'
                              : student.percentage < 75 && student.total > 0
                              ? 'text-yellow-600'
                              : 'text-green-600'}`}
                          >
                            {student.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{student.name}</p>
                          <p className="text-xs text-gray-400">{student.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Roll No */}
                    <td className="px-5 py-3 text-sm text-gray-600">
                      {student.rollNo || '—'}
                    </td>

                    {/* Present */}
                    <td className="px-5 py-3">
                      <span className="text-sm font-medium text-green-600">
                        {student.present}
                      </span>
                    </td>

                    {/* Absent */}
                    <td className="px-5 py-3">
                      <span className="text-sm font-medium text-red-500">
                        {student.absent}
                      </span>
                    </td>

                    {/* Late */}
                    <td className="px-5 py-3">
                      <span className="text-sm font-medium text-yellow-500">
                        {student.late}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="px-5 py-3 text-sm text-gray-600">
                      {student.total}
                    </td>

                    {/* Percentage with bar */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500
                              ${getBarColor(student.percentage, student.total)}`}
                            style={{ width: `${student.percentage}%` }}
                          />
                        </div>
                        <span className={`text-sm font-bold w-10 text-right
                          ${getPercentageColor(student.percentage, student.total)}`}
                        >
                          {student.total === 0 ? '—' : `${student.percentage}%`}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full
                        ${getStatusBadge(student.percentage, student.total)}`}
                      >
                        {getStatusLabel(student.percentage, student.total)}
                      </span>
                    </td>

                  </tr>
                ))
              )}
            </tbody>

            {/* Footer totals row */}
            {filtered.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td className="px-5 py-3" colSpan={3}>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Class Total / Average
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm font-bold text-green-600">{totalPresent}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm font-bold text-red-500">
                      {filtered.reduce((s, st) => s + st.absent, 0)}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm font-bold text-yellow-500">
                      {filtered.reduce((s, st) => s + st.late, 0)}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm font-bold text-gray-700">{totalClasses}</span>
                  </td>
                  <td className="px-5 py-3" colSpan={2}>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getBarColor(avgPercentage, 1)}`}
                          style={{ width: `${avgPercentage}%` }}
                        />
                      </div>
                      <span className={`text-sm font-bold ${getPercentageColor(avgPercentage, 1)}`}>
                        {avgPercentage}% avg
                      </span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* ── NOT MARKED SECTION ─────────────────────────────────── */}
      {notMarked.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full"/>
            Students With No Records ({notMarked.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {notMarked.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2"
              >
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-500">
                    {s.name?.charAt(0)}
                  </span>
                </div>
                <span className="text-sm text-gray-600">{s.name}</span>
                <span className="text-xs text-gray-400">{s.rollNo}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}