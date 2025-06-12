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

    return data.map(vehicle => ({
      chassis: vehicle.chassis_number,
      reg: vehicle.registration_number,
      depot: vehicle.depot,
      motor: vehicle.motor_number,
      dispatch: vehicle.dispatch_date,
      regDate: vehicle.registration_date,
      mfgDate: vehicle.manufacturing_date,
      model: vehicle.model,
      colour: vehicle.colour,
      seating: vehicle.seating_capacity?.toString(),
      motorKw: vehicle.motor_power_kw?.toString(),
      id: vehicle.id
    }));
  }

  // COMPLAINTS
  async getComplaints(): Promise<Complaint[]> {
    const { data: complaints, error } = await supabase
      .from('complaints')
      .select(`
        *,
        vehicles!inner(chassis_number, registration_number, depot)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch complaints:', error.message);
      return [];
    }

    return complaints.map(complaint => ({
      id: complaint.id,
      chassis: complaint.vehicles.chassis_number,
      text: complaint.description,
      date: complaint.created_at,
      status: complaint.status.toLowerCase() as 'open' | 'cleared',
      vehicleReg: complaint.vehicles.registration_number,
      vehicleDepot: complaint.vehicles.depot
    }));
  }

  async getComplaintsByVehicle(chassisNumber: string): Promise<Complaint[]> {
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id')
      .eq('chassis_number', chassisNumber)
      .single();

    if (vehicleError || !vehicle) {
      console.error('Error finding vehicle:', vehicleError?.message);
      return [];
    }

    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('vehicle_id', vehicle.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching complaints by vehicle:', error.message);
      return [];
    }

    return data.map(complaint => ({
      id: complaint.id,
      chassis: chassisNumber,
      text: complaint.description,
      date: complaint.created_at,
      status: complaint.status.toLowerCase() as 'open' | 'cleared'
    }));
  }

  async addComplaint(complaint: { chassis: string; text: string; status: string; date: string }): Promise<Complaint | null> {
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id')
      .eq('chassis_number', complaint.chassis)
      .single();

    if (vehicleError || !vehicle) {
      console.error('Error finding vehicle:', vehicleError?.message);
      return null;
    }

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      console.error('User not authenticated');
      return null;
    }

    const { data, error } = await supabase
      .from('complaints')
      .insert([{
        vehicle_id: vehicle.id,
        title: 'Vehicle Complaint',
        description: complaint.text,
        status: complaint.status === 'cleared' ? 'Closed' : 'Open',
        priority: 'Medium',
        user_id: user.user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Failed to add complaint:', error.message);
      return null;
    }

    return {
      id: data.id,
      chassis: complaint.chassis,
      text: data.description,
      date: data.created_at,
      status: data.status.toLowerCase() as 'open' | 'cleared'
    };
  }

  async updateComplaint(id: string, updates: { status: string }): Promise<Complaint | null> {
    const { data, error } = await supabase
      .from('complaints')
      .update({ 
        status: updates.status === 'cleared' ? 'Closed' : 'Open',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        vehicles!inner(chassis_number)
      `)
      .single();

    if (error) {
      console.error('Error updating complaint:', error.message);
      return null;
    }

    return {
      id: data.id,
      chassis: data.vehicles.chassis_number,
      text: data.description,
      date: data.created_at,
      status: data.status.toLowerCase() as 'open' | 'cleared'
    };
  }

  // ODOMETER READINGS
  async getOdometers(): Promise<OdometerReading[]> {
    const { data, error } = await supabase
      .from('odometer_readings')
      .select(`
        *,
        vehicles!inner(chassis_number, registration_number)
      `)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching odometer readings:', error.message);
      return [];
    }

    return data.map(reading => ({
      id: reading.id,
      chassis: reading.vehicles.chassis_number,
      value: reading.reading,
      date: reading.date,
      vehicleReg: reading.vehicles.registration_number
    }));
  }

  async getOdometersByVehicle(chassisNumber: string): Promise<OdometerReading[]> {
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id')
      .eq('chassis_number', chassisNumber)
      .single();

    if (vehicleError || !vehicle) {
      console.error('Error finding vehicle:', vehicleError?.message);
      return [];
    }

    const { data, error } = await supabase
      .from('odometer_readings')
      .select('*')
      .eq('vehicle_id', vehicle.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching odometer readings by vehicle:', error.message);
      return [];
    }

    return data.map(reading => ({
      id: reading.id,
      chassis: chassisNumber,
      value: reading.reading,
      date: reading.date
    }));
  }

  async addOdometer(reading: { chassis: string; value: number; date: string }): Promise<OdometerReading | null> {
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id')
      .eq('chassis_number', reading.chassis)
      .single();

    if (vehicleError || !vehicle) {
      console.error('Error finding vehicle:', vehicleError?.message);
      return null;
    }

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      console.error('User not authenticated');
      return null;
    }

    const { data, error } = await supabase
      .from('odometer_readings')
      .insert([{
        vehicle_id: vehicle.id,
        reading: reading.value,
        date: reading.date.split('T')[0], // Extract date part
        user_id: user.user.id,
        notes: ''
      }])
      .select()
      .single();

    if (error) {
      console.error('Failed to add odometer reading:', error.message);
      return null;
    }

    return {
      id: data.id,
      chassis: reading.chassis,
      value: data.reading,
      date: data.date
    };
  }

  // FILE UPLOADS (SOP Documents)
  async uploadFile(file: { name: string; content: string; chassis: string; type: 'sop' | 'retro' }): Promise<FileUpload | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      console.error('User not authenticated');
      return null;
    }

    if (file.type === 'sop') {
      const { data, error } = await supabase
        .from('sop_documents')
        .insert([{
          title: file.name,
          description: `SOP document for chassis ${file.chassis}`,
          file_url: file.content,
          file_name: file.name,
          user_id: user.user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error uploading SOP file:', error.message);
        return null;
      }

      return {
        id: data.id,
        name: data.file_name,
        content: data.file_url,
        chassis: file.chassis,
        type: 'sop',
        uploadDate: data.created_at
      };
    } else {
      // For retro files, we'll use retro_entries table
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select('id')
        .eq('chassis_number', file.chassis)
        .single();

      if (vehicleError || !vehicle) {
        console.error('Error finding vehicle:', vehicleError?.message);
        return null;
      }

      const { data, error } = await supabase
        .from('retro_entries')
        .insert([{
          vehicle_id: vehicle.id,
          entry_type: 'document',
          description: `Retro document: ${file.name}`,
          user_id: user.user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error uploading retro file:', error.message);
        return null;
      }

      return {
        id: data.id,
        name: file.name,
        content: file.content,
        chassis: file.chassis,
        type: 'retro',
        uploadDate: data.created_at
      };
    }
  }

  async getFilesByType(type: 'sop' | 'retro', chassisNumber?: string): Promise<FileUpload[]> {
    if (type === 'sop') {
      const { data, error } = await supabase
        .from('sop_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching SOP files:', error.message);
        return [];
      }

      return data.map(doc => ({
        id: doc.id,
        name: doc.file_name || doc.title,
        content: doc.file_url || '',
        chassis: chassisNumber || '',
        type: 'sop',
        uploadDate: doc.created_at
      }));
    } else {
      if (!chassisNumber) return [];

      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select('id')
        .eq('chassis_number', chassisNumber)
        .single();

      if (vehicleError || !vehicle) {
        console.error('Error finding vehicle:', vehicleError?.message);
        return [];
      }

      const { data, error } = await supabase
        .from('retro_entries')
        .select('*')
        .eq('vehicle_id', vehicle.id)
        .eq('entry_type', 'document')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching retro files:', error.message);
        return [];
      }

      return data.map(entry => ({
        id: entry.id,
        name: entry.description.replace('Retro document: ', ''),
        content: '', // We'll need to store file content separately
        chassis: chassisNumber,
        type: 'retro',
        uploadDate: entry.created_at
      }));
    }
  }

  // SUMMARY
  async getOdometerSummary(): Promise<OdometerSummary[]> {
    const { data: readings, error } = await supabase
      .from('odometer_readings')
      .select(`
        *,
        vehicles!inner(registration_number, depot, chassis_number)
      `)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching odometer summary:', error.message);
      return [];
    }

    // Group by depot and get latest reading per vehicle
    const depotMap = new Map<string, OdometerSummary>();

    readings.forEach(reading => {
      const depot = reading.vehicles.depot || 'Unknown';
      const vehicleReg = reading.vehicles.registration_number || 'Unknown';
      const chassisNumber = reading.vehicles.chassis_number;

      if (!depotMap.has(depot)) {
        depotMap.set(depot, {
          depot,
          totalOdometer: 0,
          vehicleCount: 0,
          vehicles: []
        });
      }

      const depotData = depotMap.get(depot)!;
      
      // Check if we already have this vehicle
      const existingVehicle = depotData.vehicles.find(v => v.reg === vehicleReg);
      
      if (!existingVehicle) {
        depotData.vehicles.push({
          reg: vehicleReg,
          lastReading: reading.reading,
          date: reading.date
        });
        depotData.totalOdometer += reading.reading;
        depotData.vehicleCount += 1;
      } else {
        // Update if this reading is more recent
        const existingDate = new Date(existingVehicle.date);
        const currentDate = new Date(reading.date);
        
        if (currentDate > existingDate) {
          depotData.totalOdometer = depotData.totalOdometer - existingVehicle.lastReading + reading.reading;
          existingVehicle.lastReading = reading.reading;
          existingVehicle.date = reading.date;
        }
      }
    });

    return Array.from(depotMap.values());
  }
}

export const apiService = new ApiService();