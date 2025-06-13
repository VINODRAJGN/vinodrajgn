import React, { useState } from 'react';
import { Plus, Upload, AlertTriangle, CheckCircle } from 'lucide-react';
import { apiService } from '../../services/api';

export const VehicleManagementPage: React.FC = () => {
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleBulkImport = async () => {
    setImporting(true);
    setImportStatus(null);

    try {
      // Sample vehicle data that can be imported
      const sampleVehicles = [
        {
          chassis_number: 'CHASSIS001',
          registration_number: 'KA01AB1234',
          depot: 'Depot A',
          motor_number: 'MOTOR001',
          model: 'Electric Bus Model A',
          colour: 'White',
          seating_capacity: 50,
          motor_power_kw: 150
        },
        {
          chassis_number: 'CHASSIS002',
          registration_number: 'KA01AB1235',
          depot: 'Depot B',
          motor_number: 'MOTOR002',
          model: 'Electric Bus Model B',
          colour: 'Blue',
          seating_capacity: 45,
          motor_power_kw: 140
        },
        {
          chassis_number: 'CHASSIS003',
          registration_number: 'KA01AB1236',
          depot: 'Depot A',
          motor_number: 'MOTOR003',
          model: 'Electric Bus Model A',
          colour: 'Green',
          seating_capacity: 50,
          motor_power_kw: 150
        }
      ];

      // Try to insert sample vehicles
      const results = await Promise.allSettled(
        sampleVehicles.map(vehicle => 
          apiService.addVehicle(vehicle)
        )
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      setImportStatus({
        success: successful > 0,
        message: `Import completed: ${successful} vehicles added, ${failed} failed`
      });

    } catch (error) {
      setImportStatus({
        success: false,
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Vehicle Management</h2>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 mb-1">
                Database Configuration Required
              </h3>
              <p className="text-sm text-yellow-700 mb-3">
                Your Supabase database has Row Level Security enabled but no access policies are configured. 
                This prevents the application from reading or writing vehicle data.
              </p>
              <p className="text-sm text-yellow-700">
                Please check the <strong>DATABASE_SETUP.md</strong> file for detailed setup instructions, 
                or contact your database administrator to configure the necessary policies.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Setup</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add sample vehicles to test the application functionality.
            </p>
            <button
              onClick={handleBulkImport}
              disabled={importing}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Sample Vehicles
                </>
              )}
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Manual Entry</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add vehicles individually through the form interface.
            </p>
            <button
              disabled
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-500 bg-gray-100 cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle (Coming Soon)
            </button>
          </div>
        </div>

        {importStatus && (
          <div className={`mt-6 p-4 rounded-lg border ${
            importStatus.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center">
              {importStatus.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              )}
              <span className={`text-sm font-medium ${
                importStatus.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {importStatus.message}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Setup Instructions</h3>
        <div className="prose prose-sm max-w-none">
          <ol className="text-sm text-gray-700 space-y-2">
            <li>Open your Supabase dashboard</li>
            <li>Navigate to <strong>Authentication → Policies</strong></li>
            <li>Add read/write policies for the <code>vehicles</code> table</li>
            <li>Return to this application and test the import function</li>
          </ol>
          <p className="text-sm text-gray-600 mt-4">
            For detailed SQL commands and complete setup instructions, refer to the 
            <strong> DATABASE_SETUP.md</strong> file in your project root.
          </p>
        </div>
      </div>
    </div>
  );
};