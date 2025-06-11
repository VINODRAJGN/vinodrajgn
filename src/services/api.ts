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

    if (error) throw error;
    return data;
  }

  // COMPLAINTS
  async getComplaints(): Promise<Complaint[]> {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getComplaintsByVehicle(vehicle_id: string): Promise<Complaint[]> {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('vehicle_id', vehicle_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async addComplaint(complaint: Omit<Complaint, 'id'>): Promise<Complaint> {
    const { data, error } = await supabase
      .from('complaints')
      .insert([complaint])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateComplaint(id: string, updates: Partial<Complaint>): Promise<Complaint> {
    const { data, error } = await supabase
      .from('complaints')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ODOMETER
  async getOdometers(): Promise<OdometerReading[]> {
    const { data, error } = await supabase
      .from('retro_entries')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getOdometersByVehicle(vehicle_id: string): Promise<OdometerReading[]> {
    const { data, error } = await supabase
      .from('retro_entries')
      .select('*')
      .eq('vehicle_id', vehicle_id)
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  }

  async addOdometer(reading: Omit<OdometerReading, 'id'>): Promise<OdometerReading> {
    const { data, error } = await supabase
      .from('retro_entries')
      .insert([reading])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

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

      const latestReading = odometers
        .filter(o => o.vehicle_id === vehicle.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      if (latestReading) {
        acc[depot].totalOdometer += latestReading.reading;
        acc[depot].vehicles.push({
          reg: vehicle.registration_number || 'Unknown',
          lastReading: latestReading.reading,
          date: latestReading.date
        });
      }

      acc[depot].vehicleCount = acc[depot].vehicles.length;
      return acc;
    }, {} as Record<string, OdometerSummary>);

    return Object.values(summary);
  }

  // FILE UPLOADS (SOP/RETRO)
  async uploadFile(file: Omit<FileUpload, 'id' | 'uploadDate'>): Promise<FileUpload> {
    const { data, error } = await supabase
      .from(file.type === 'sop' ? 'sop_docs' : 'complaint_attachments')
      .insert([{
        ...file,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getFilesByType(type: 'sop' | 'retro', vehicle_id?: string): Promise<FileUpload[]> {
    const table = type === 'sop' ? 'sop_docs' : 'complaint_attachments';

    const query = supabase.from(table).select('*');

    if (vehicle_id) query.eq('vehicle_id', vehicle_id);

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }
}

export const apiService = new ApiService();
