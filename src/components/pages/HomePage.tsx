import React, { useState, useEffect } from 'react';
import { Eye, Loader, RefreshCw } from 'lucide-react';
import { Vehicle } from '../../types';
import { apiService } from '../../services/api';

interface HomePageProps {
  onViewDetails: (vehicle: Vehicle) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onViewDetails }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('HomePage: Starting to load vehicles...');
      
      const data = await apiService.getVehicles();
      console.log('HomePage: Received vehicles data:', data);
      
      setVehicles(data);
      
      if (data.length === 0) {
        setError('No vehicles found in the database. Please check if vehicles are properly added to the database.');
      }
    } catch (err) {
      console.error('HomePage: Error loading vehicles:', err);
      setError('Failed to load vehicles from database. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const getRegistrationState = (reg?: string) => {
    if (!reg || reg === "Pending") return "N/A";
    const stateCode = reg.substring(0, 2);
    const stateMap: Record<string, string> = {
      "KA": "Karnataka",
      "TN": "Tamil Nadu",
      "AP": "Andhra Pradesh",
      "RJ": "Rajasthan"
    };
    return stateMap[stateCode] || "Unknown";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Loading vehicles...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={loadVehicles}
          className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry</span>
        </button>
        <div className="mt-4 text-sm text-gray-600">
          <p>Debug info:</p>
          <p>Check browser console for detailed error messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Project - 13.5EV Coach Bus</h2>
        <p className="text-gray-600">Fleet Management Dashboard</p>
        <div className="mt-2 text-sm text-gray-500">
          Found {vehicles.length} vehicles in database
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="px-6 py-4 text-left font-semibold">Vehicle Number</th>
                <th className="px-6 py-4 text-left font-semibold">Registration Number</th>
                <th className="px-6 py-4 text-left font-semibold">Registration State</th>
                <th className="px-6 py-4 text-left font-semibold">Chassis Number</th>
                <th className="px-6 py-4 text-left font-semibold">Fleet Operation Depot</th>
                <th className="px-6 py-4 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="space-y-2">
                      <p>No vehicles found</p>
                      <button
                        onClick={loadVehicles}
                        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>Refresh</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle, index) => (
                  <tr
                    key={vehicle.id || vehicle.chassis || index}
                    className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {vehicle.chassis}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {vehicle.reg || 'Pending'}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {getRegistrationState(vehicle.reg)}
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-mono text-sm">
                      {vehicle.chassis}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {vehicle.depot || 'Not Assigned'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => onViewDetails(vehicle)}
                        className="inline-flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};