import { useState, useEffect } from "react";
import API from "../../../../api/axios";

export default function AssignToStudent() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // ── fetch all data on mount ───────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        // axios returns { data: ... } directly — no .json() needed
        const [studentsRes, subjectsRes, enrollRes] = await Promise.all([
          API.get("/admin/users?role=student"),
          API.get("/admin/subjects"),
          API.get("/admin/users?enrollmentStatus=aprroved"),
        ]);

        setStudents(studentsRes.data.data || []);
         console.log('assign subject to student',studentsRes.data)
        setSubjects(subjectsRes.data || []);
        setEnrollments(enrollRes.data.data || []);
      } catch {
        showMessage("Failed to load data.", "error");
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── helpers ───────────────────────────────────────────────────────────────
  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3500);
  };

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  // ── enroll ────────────────────────────────────────────────────────────────
  const handleEnroll = async () => {
    if (!selectedStudent || !selectedSubject) {
      showMessage("Please select both a student and a subject.", "error");
      return;
    }

    const alreadyEnrolled = enrollments.find(
      (e) => e.studentId === selectedStudent && e.subjectId === selectedSubject
    );
    if (alreadyEnrolled) {
      const sName = students.find((s) => s._id === selectedStudent)?.name;
      const subName = subjects.find((s) => s._id === selectedSubject)?.name;
      showMessage(`${sName} is already enrolled in ${subName}.`, "error");
      return;
    }

    setLoading(true);
    try {
      await API.post("/subjects/enroll", {
        studentId: selectedStudent,
        subjectId: selectedSubject,
      });

      const sName = students.find((s) => s._id === selectedStudent)?.name;
      const subName = subjects.find((s) => s._id === selectedSubject)?.name;
      showMessage(`${sName} enrolled in ${subName} successfully.`, "success");

      setEnrollments((prev) => [
        ...prev,
        { studentId: selectedStudent, subjectId: selectedSubject },
      ]);
      setSelectedStudent("");
      setSelectedSubject("");
    } catch (err) {
      const msg = err.response?.data?.message || "Enrollment failed.";
      showMessage(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── remove ────────────────────────────────────────────────────────────────
  const handleRemove = async (studentId, subjectId) => {
    try {
      await API.delete("/enroll", {
        data: { studentId, subjectId }, // axios DELETE body goes in `data`
      });

      setEnrollments((prev) =>
        prev.filter(
          (e) => !(e.studentId === studentId && e.subjectId === subjectId)
        )
      );
      showMessage("Enrollment removed.", "success");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to remove.";
      showMessage(msg, "error");
    }
  };

  // ── filtered list ─────────────────────────────────────────────────────────
  const filtered = enrollments.filter((e) => {
    const s = students.find((x) => x._id === e.studentId);
    const sub = subjects.find((x) => x._id === e.subjectId);
    const q = search.toLowerCase();
    return (
      s?.name.toLowerCase().includes(q) ||
      s?.rollNo?.toLowerCase().includes(q) ||
      sub?.name.toLowerCase().includes(q)
    );
  });

  // ── loading screen ────────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
      </div>
    );
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Student Enrollment</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage subject enrollments for students
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Students", value: students.length },
          { label: "Total Subjects", value: subjects.length },
          { label: "Enrollments", value: enrollments.length },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Enroll Form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Enroll a student
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Student
            </label>
            <select
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="">Select student...</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.rollNo}) semester {s.semester}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Subject
            </label>
            <select
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">Select subject...</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} — {s.code} — Semester{s.semester}
                </option>
              ))}
            </select>
          </div>
        </div>

        {message.text && (
          <div
            className={`text-sm px-3 py-2 rounded-lg mb-4 ${
              message.type === "error"
                ? "bg-red-50 text-red-600"
                : "bg-green-50 text-green-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          onClick={handleEnroll}
          disabled={loading}
          className="w-full bg-gray-900 hover:bg-gray-700 active:scale-[0.99] disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg transition-all"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Enrolling...
            </span>
          ) : (
            "Enroll student"
          )}
        </button>
      </div>

      {/* Enrollments List */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            Enrollments
            <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {filtered.length}
            </span>
          </h2>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 w-44 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No enrollments found.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((e, i) => {
              const s = students.find((x) => x._id === e.studentId);
              const sub = subjects.find((x) => x._id === e.subjectId);
              return (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-xs font-semibold text-blue-600 shrink-0">
                      {getInitials(s?.name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {s?.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {s?.rollNo}
                        <span className="mx-1">·</span>
                        {sub?.name}
                        <span className="text-gray-300 ml-1">({sub?.code})</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(e.studentId, e.subjectId)}
                    className="text-xs text-red-500 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}