import React, { useState, useEffect } from 'react';
import { Upload, FileText, Download, Eye, Loader, X } from 'lucide-react';
import { Vehicle, FileUpload } from '../../types';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface SOPPageProps {
  vehicles: Vehicle[];
}

export const SOPPage: React.FC<SOPPageProps> = ({ vehicles }) => {
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewingFile, setViewingFile] = useState<FileUpload | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (selectedVehicle) {
      loadFiles();
    }
  }, [selectedVehicle]);

  const loadFiles = async () => {
    if (!selectedVehicle) return;
    
    try {
      setLoading(true);
      const data = await apiService.getFilesByType('sop', selectedVehicle);
      setFiles(data);
    } catch (error) {
      console.error('Error loading SOP files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedVehicle) return;

    if (user?.role === 'guest') {
      alert('Guests cannot upload files.');
      return;
    }

    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxFileSize) {
      alert('File is too large. Maximum size is 5MB.');
      return;
    }

    const allowedTypes = ['xlsx', 'xls', 'csv', 'pdf'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedTypes.includes(extension)) {
      alert('Only XLSX, XLS, CSV, and PDF files are allowed.');
      return;
    }

    try {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        await apiService.uploadFile({
          name: file.name,
          content,
          chassis: selectedVehicle,
          type: 'sop'
        });
        event.target.value = '';
        loadFiles();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const canUpload = user?.role !== 'guest';

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">SOP for Maintenance</h2>
        <p className="text-gray-600">Standard Operating Procedures Management</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        {canUpload && (
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload SOP Document</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="vehicle-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Vehicle
                </label>
                <select
                  id="vehicle-select"
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">-- Select a Vehicle --</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.chassis} value={vehicle.chassis}>
                      {vehicle.reg || 'Unknown'} ({vehicle.chassis})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Select File (XLSX, XLS, CSV, PDF)
                </label>
                <input
                  id="file-input"
                  type="file"
                  accept=".xlsx,.xls,.csv,.pdf"
                  onChange={handleFileUpload}
                  disabled={!selectedVehicle || uploading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </div>

              {uploading && (
                <div className="flex items-center space-x-2 text-green-600">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Uploading file...</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SOP Documents</h3>
          
          {!selectedVehicle ? (
            <p className="text-gray-500 text-center py-8">Please select a vehicle to view SOP files.</p>
          ) : loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="h-6 w-6 animate-spin text-green-600" />
              <span className="ml-2 text-gray-600">Loading files...</span>
            </div>
          ) : files.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No SOP files uploaded for this vehicle.</p>
          ) : (
            <div className="space-y-3">
              {files.map((file, index) => (
                <div key={file.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        Uploaded on {new Date(file.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewingFile(file)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    <a
                      href={file.content}
                      download={file.name}
                      className="flex items-center space-x-1 text-green-600 hover:text-green-700 font-medium"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* File Viewer Modal */}
      {viewingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">{viewingFile.name}</h3>
              <button
                onClick={() => setViewingFile(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 overflow-auto max-h-[70vh]">
              {viewingFile.name.endsWith('.pdf') ? (
                <iframe
                  src={viewingFile.content}
                  className="w-full h-96 border border-gray-300 rounded-lg"
                  title={viewingFile.name}
                />
              ) : (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-gray-600">
                    Preview not available for this file type. Please download to view the content.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};