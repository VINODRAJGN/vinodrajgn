import { supabase } from '../supabaseClient';
import {
  Vehicle,
  Complaint,
  OdometerReading,
  FileUpload,
  OdometerSummary
} from '../types';

class ApiService {
  // VEHICLES
  async getVehicles(): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch vehicles:', error.message);
      return [];
    }

    return data;
  }

  // COMPLAINTS
  async getComplaints(): Promise<Complaint[]> {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch complaints:', error.message);
      return [];
    }

    return data;
  }

  async getComplaintsByVehicle(vehicle_id: string): Promise<Complaint[]> {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('vehicle_id', vehicle_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching complaints by vehicle:', error.message);
      return [];
    }

    return data;
  }

  async addComplaint(complaint: Omit<Complaint, 'id'>): Promise<Complaint | null> {
    const { data, error } = await supabase
      .from('complaints')
      .insert([complaint])
      .select()
      .single();

    if (error) {
      console.error('Failed to add complaint:', error.message);
      return null;
    }

    return data;
  }

  async updateComplaint(id: string, updates: Partial<Complaint>): Promise<Complaint | null> {
    const { data, error } = await supabase
      .from('complaints')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating complaint:', error.message);
      return null;
    }

    return data;
  }

  // ODOMETER / RETRO ENTRIES
  async getOdometers(): Promise<OdometerReading[]> {
    const { data, error } = await supabase
      .from('retro_entries')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching odometers:', error.message);
      return [];
    }

    return data;
  }

  async getOdometersByVehicle(vehicle_id: string): Promise<OdometerReading[]> {
    const { data, error } = await supabase
      .from('retro_entries')
      .select('*')
      .eq('vehicle_id', vehicle_id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching odometers by vehicle:', error.message);
      return [];
    }

    return data;
  }

  async addOdometer(reading: Omit<OdometerReading, 'id'>): Promise<OdometerReading | null> {
    const { data, error } = await supabase
      .from('retro_entries')
      .insert([reading])
      .select()
      .single();

    if (error) {
      console.error('Failed to add odometer reading:', error.message);
      return null;
    }

    return data;
  }

  // FILE UPLOADS (SOP / RETRO DOCS)
  async uploadFile(file: Omit<FileUpload, 'id' | 'uploadDate'>): Promise<FileUpload | null> {
    const table = file.type === 'sop' ? 'sop_docs' : 'complaint_attachments';

    const { data, error } = await supabase
      .from(table)
      .insert([{ ...file, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      console.error('Error uploading file:', error.message);
      return null;
    }

    return data;
  }

  async getFilesByType(type: 'sop' | 'retro', vehicle_id?: string): Promise<FileUpload[]> {
    const table = type === 'sop' ? 'sop_docs' : 'complaint_attachments';
    let query = supabase.from(table).select('*');

    if (vehicle_id) query = query.eq('vehicle_id', vehicle_id);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching files:', error.message);
      return [];
    }

    return data;
  }

  // SUMMARY
  async getOdometerSummary(): Promise<OdometerSummary[]> {
    const vehicles = await this.getVehicles();
    const odometers = await this.getOdometers();

    const summary = vehicles.reduce((acc, vehicle) => {
      const depot = vehicle.depot || 'Unknown';

      if (!acc[depot]) {
        acc[depot] = {
          depot,
          totalOdometer: 0,
          vehicleCount: 0,
          vehicles: []
        };
      }

      const latest = odometers
        .filter(o => o.vehicle_id === vehicle.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      if (latest) {
        acc[depot].totalOdometer += latest.reading;
        acc[depot].vehicles.push({
          reg: vehicle.registration_number || 'Unknown',
          lastReading: latest.reading,
          date: latest.date
        });
      }

      acc[depot].vehicleCount = acc[depot].vehicles.length;

      return acc;
    }, {} as Record<string, OdometerSummary>);

    return Object.values(summary);
  }
}

export const apiService = new ApiService();
