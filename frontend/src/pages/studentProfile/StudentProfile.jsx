import React, { useState, useEffect } from 'react';
import API from '../../api/axios'; // Make sure axios is installed

const StudentProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await API.get('http://localhost:3000/api/student/profile');
        
        if (res.data) {
          setUser(res.data);
          console.log(res.data)
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">⚠️ {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Student Information</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="h-32 bg-linear-to-r from-blue-600 to-indigo-600 relative">
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
              <div className="w-28 h-28 rounded-full border-4 border-white bg-white overflow-hidden shadow-md">
                {user?.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-5xl">
                    👨‍🎓
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-16 pb-8 px-8">
            {/* Student Name & Roll No */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-gray-900">
                {user?.data.name || 'Student Name'}
              </h2>
              <p className="text-gray-500 mt-1 text-lg">
                {user?.data.rollNo || 'Roll Number'}
              </p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="font-medium text-gray-800">{user?.data.email || 'N/A'}</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-sm text-gray-500 mb-1">Department</p>
                <p className="font-medium text-gray-800">{user?.data.department || 'N/A'}</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-sm text-gray-500 mb-1">Semester</p>
                <p className="font-medium text-gray-800">{user?.data.semester || 'N/A'}</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-sm text-gray-500 mb-1">Batch</p>
                <p className="font-medium text-gray-800">{user?.data.batch || 'N/A'}</p>
              </div>
            </div>

            {/* Additional Info */}
            {user?.phone && (
              <div className="mt-6 bg-gray-50 rounded-2xl p-5">
                <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                <p className="font-medium text-gray-800">{user.phone}</p>
              </div>
            )}

            {user?.address && (
              <div className="mt-6 bg-gray-50 rounded-2xl p-5">
                <p className="text-sm text-gray-500 mb-1">Address</p>
                <p className="font-medium text-gray-800">{user.address}</p>
              </div>
            )}
          </div>
        </div>

        {/* Edit Profile Button */}
        <div className="text-center mt-8">
          <button className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium transition-all active:scale-95 shadow-lg">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;