import React, { useState, useEffect } from 'react';
import { Eye, Loader } from 'lucide-react';
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
      const data = await apiService.getVehicles();
      setVehicles(data);
    } catch (err) {
      setError('Failed to load vehicles');
      console.error('Error loading vehicles:', err);
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
        <p className="text-red-700">{error}</p>
        <button
          onClick={loadVehicles}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Project - 13.5EV Coach Bus</h2>
        <p className="text-gray-600">Fleet Management Dashboard</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="px-6 py-4 text-left font-semibold">Vehicle Registration Number</th>
                <th className="px-6 py-4 text-left font-semibold">Registration State</th>
                <th className="px-6 py-4 text-left font-semibold">Chassis Number</th>
                <th className="px-6 py-4 text-left font-semibold">Fleet Operation Depot</th>
                <th className="px-6 py-4 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No vehicles found
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle, index) => (
                  <tr
                    key={vehicle.chassis}
                    className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {vehicle.reg || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {getRegistrationState(vehicle.reg)}
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-mono text-sm">
                      {vehicle.chassis}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {vehicle.depot || 'N/A'}
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