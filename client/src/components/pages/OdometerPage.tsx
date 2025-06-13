import React, { useState, useEffect } from 'react';
import { Gauge, RefreshCw, Loader, Calendar } from 'lucide-react';
import { OdometerSummary } from '../../types';
import { apiService } from '../../services/api';

export const OdometerPage: React.FC = () => {
  const [summaryData, setSummaryData] = useState<OdometerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'all' | 'day' | 'week' | 'month'>('all');

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await apiService.getOdometerSummary();
      setSummaryData(data);
    } catch (error) {
      console.error('Error loading odometer summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadSummary();
    } finally {
      setRefreshing(false);
    }
  };

  const filterByTimePeriod = (data: OdometerSummary[], period: string) => {
    if (period === 'all') return data;
    
    const now = new Date();
    const timeFilters = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    };

    return data.map(depot => {
      const filteredVehicles = depot.vehicles.filter(v => {
        const readingDate = new Date(v.date);
        return (now.getTime() - readingDate.getTime()) <= timeFilters[period as keyof typeof timeFilters];
      });

      return {
        ...depot,
        vehicles: filteredVehicles,
        totalOdometer: filteredVehicles.reduce((sum, v) => sum + v.lastReading, 0),
        vehicleCount: filteredVehicles.length
      };
    }).filter(depot => depot.vehicleCount > 0);
  };

  const filteredData = filterByTimePeriod(summaryData, timeFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Loading odometer summary...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Odometer Summary</h2>
        <p className="text-gray-600">Vehicle mileage tracking and analytics</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-gray-400" />
            <label htmlFor="time-filter" className="font-medium text-gray-700">
              Filter by Time Period:
            </label>
            <select
              id="time-filter"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="day">Last 24 Hours</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
            <div className="flex items-center space-x-3">
              <Gauge className="h-8 w-8" />
              <div>
                <p className="text-blue-100">Total Distance</p>
                <p className="text-2xl font-bold">
                  {filteredData.reduce((sum, depot) => sum + depot.totalOdometer, 0).toLocaleString()} km
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold">
                D
              </div>
              <div>
                <p className="text-green-100">Active Depots</p>
                <p className="text-2xl font-bold">{filteredData.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold">
                V
              </div>
              <div>
                <p className="text-purple-100">Total Vehicles</p>
                <p className="text-2xl font-bold">
                  {filteredData.reduce((sum, depot) => sum + depot.vehicleCount, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="px-6 py-4 text-left font-semibold">Depot</th>
                <th className="px-6 py-4 text-right font-semibold">Total Odometer (km)</th>
                <th className="px-6 py-4 text-center font-semibold">Vehicle Count</th>
                <th className="px-6 py-4 text-left font-semibold">Vehicle Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No odometer data available for the selected time period
                  </td>
                </tr>
              ) : (
                filteredData.map((depot, index) => (
                  <tr
                    key={depot.depot}
                    className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {depot.depot}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-blue-600">
                      {depot.totalOdometer.toLocaleString()} km
                    </td>
                    <td className="px-6 py-4 text-center font-medium">
                      {depot.vehicleCount}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {depot.vehicles
                          .sort((a, b) => a.reg.localeCompare(b.reg))
                          .map((vehicle, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="font-medium text-gray-900">{vehicle.reg}</span>
                              <span className="text-gray-500 ml-2">
                                ({vehicle.lastReading.toLocaleString()} km)
                              </span>
                            </div>
                          ))}
                      </div>
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