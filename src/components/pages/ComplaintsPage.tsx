import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader, Filter } from 'lucide-react';
import { Complaint, Vehicle } from '../../types';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface ComplaintsPageProps {
  vehicles: Vehicle[];
}

export const ComplaintsPage: React.FC<ComplaintsPageProps> = ({ vehicles }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'cleared'>('all');
  const [updatingComplaint, setUpdatingComplaint] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await apiService.getComplaints();
      setComplaints(data);
    } catch (error) {
      console.error('Error loading complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseComplaint = async (complaintId: string) => {
    if (user?.role !== 'admin') {
      alert('Only admins can close complaints.');
      return;
    }

    try {
      setUpdatingComplaint(complaintId);
      await apiService.updateComplaint(complaintId, { status: 'cleared' });
      await loadComplaints();
    } catch (error) {
      console.error('Error closing complaint:', error);
      alert('Failed to close complaint. Please try again.');
    } finally {
      setUpdatingComplaint(null);
    }
  };

  const getVehicleInfo = (chassis: string) => {
    return vehicles.find(v => v.chassis === chassis) || { reg: 'Unknown', depot: 'Unknown' };
  };

  const filteredComplaints = complaints.filter(complaint => 
    statusFilter === 'all' || complaint.status === statusFilter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Loading complaints...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Complaints Summary</h2>
        <p className="text-gray-600">Track and manage vehicle complaints</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <label htmlFor="status-filter" className="font-medium text-gray-700">
              Filter by Status:
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'open' | 'cleared')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="cleared">Cleared</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-500">
            {filteredComplaints.length} complaint{filteredComplaints.length !== 1 ? 's' : ''} found
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="px-6 py-4 text-left font-semibold">Vehicle Registration</th>
                <th className="px-6 py-4 text-left font-semibold">Fleet Operation Depot</th>
                <th className="px-6 py-4 text-left font-semibold">Complaint</th>
                <th className="px-6 py-4 text-left font-semibold">Date</th>
                <th className="px-6 py-4 text-center font-semibold">Status</th>
                <th className="px-6 py-4 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No complaints found
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((complaint, index) => {
                  const vehicleInfo = getVehicleInfo(complaint.chassis);
                  return (
                    <tr
                      key={complaint.id}
                      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {vehicleInfo.reg}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {vehicleInfo.depot}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {complaint.text}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {new Date(complaint.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                            complaint.status === 'open'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {complaint.status === 'open' ? (
                            <AlertCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          <span className="capitalize">{complaint.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {complaint.status === 'open' && user?.role === 'admin' ? (
                          <button
                            onClick={() => handleCloseComplaint(complaint.id)}
                            disabled={updatingComplaint === complaint.id}
                            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingComplaint === complaint.id ? (
                              <div className="flex items-center space-x-2">
                                <Loader className="h-4 w-4 animate-spin" />
                                <span>Closing...</span>
                              </div>
                            ) : (
                              'Close'
                            )}
                          </button>
                        ) : (
                          <span className="text-gray-400 font-medium">Locked</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};