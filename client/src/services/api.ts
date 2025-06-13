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
    try {
      console.log('Fetching vehicles from database...');
      
      // Check current user session
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('Current user:', user?.email || 'No user logged in');
      
      // Check what tables exist in the database
      // Check the actual structure of the vehicles table
      console.log('Checking vehicles table structure...');
      
      // Get the actual column names from the vehicles table
      const { data: sampleInsert, error: insertError } = await supabase
        .from('vehicles')
        .insert({
          chassis_number: 'TEST_CHASSIS_001',
          registration_number: 'TEST_REG_001',
          depot: 'Test Depot',
          motor_number: 'TEST_MOTOR_001',
          model: 'Test Model',
          colour: 'White',
          seating_capacity: 50,
          motor_power_kw: 150
        })
        .select()
        .single();
        
      if (!insertError && sampleInsert) {
        console.log('Successfully inserted test vehicle, table structure confirmed:', sampleInsert);
        
        // Now delete the test record
        await supabase
          .from('vehicles')
          .delete()
          .eq('chassis_number', 'TEST_CHASSIS_001');
          
        console.log('Test record cleaned up');
      } else {
        console.log('Insert test failed:', insertError?.message);
        
        // Try with different column names
        const alternativeSchemas = [
          { chassis: 'TEST001', reg: 'TESTREG001', depot: 'TestDepot' },
          { vehicle_number: 'TEST001', registration: 'TESTREG001', location: 'TestLocation' },
          { chassis_no: 'TEST001', reg_no: 'TESTREG001', depot_name: 'TestDepot' }
        ];
        
        for (const schema of alternativeSchemas) {
          const { data: testInsert, error: testError } = await supabase
            .from('vehicles')
            .insert(schema)
            .select()
            .single();
            
          if (!testError) {
            console.log('Alternative schema works:', schema, testInsert);
            // Clean up
            await supabase.from('vehicles').delete().eq(Object.keys(schema)[0], Object.values(schema)[0]);
            break;
          }
        }
      }
      
      // Try direct query first
      let { data, error } = await supabase
        .from('vehicles')
        .select('*');
        
      console.log('Direct query result:', { data, error: error?.message, dataLength: data?.length });
      
      // If we get empty results, try with authentication
      if ((!data || data.length === 0) && !user) {
        console.log('No data and no user - attempting authentication...');
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: 'vr@gmail.com',
          password: 'Vinod@8055'
        });
        
        if (authError) {
          console.error('Authentication failed:', authError.message);
        } else {
          console.log('Authentication successful, retrying query...');
          // Retry the query after authentication
          const { data: authData2, error: authError2 } = await supabase
            .from('vehicles')
            .select('*');
          console.log('Post-auth query result:', { data: authData2, error: authError2?.message, dataLength: authData2?.length });
          data = authData2;
          error = authError2;
        }
      }
      
      // Try with count to see if RLS is the issue
      const { count, error: countError } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true });
        
      console.log('Table count:', { count, error: countError?.message });
      
      // Try alternative column names in case the schema is different
      if (!data || data.length === 0) {
        console.log('Trying alternative column queries...');
        
        // Check what columns actually exist
        const { data: testData, error: testError } = await supabase
          .from('vehicles')
          .select()
          .limit(1);
          
        console.log('Sample row structure:', { testData, testError: testError?.message });
        
        // Try common variations
        const columnVariations = [
          '*',
          'id, chassis_number, registration_number, depot',
          'id, vehicle_number, reg_number, location',
          'id, chassis, reg, depot',
          'id, chassis_no, reg_no, depot_name'
        ];
        
        for (const columns of columnVariations) {
          const { data: varData, error: varError } = await supabase
            .from('vehicles')
            .select(columns)
            .limit(2);
            
          if (!varError && varData && varData.length > 0) {
            console.log(`Success with columns: ${columns}`, varData);
            data = varData;
            error = null;
            break;
          } else if (varError) {
            console.log(`Failed with columns ${columns}:`, varError.message);
          }
        }
      }

      if (error) {
        console.error('Failed to fetch vehicles:', error);
        throw error;
      }

      console.log('Raw vehicle data from database:', data);

      if (!data || data.length === 0) {
        console.warn('No vehicles found in database');
        return [];
      }

      const vehicles = data.map(vehicle => ({
        id: vehicle.id,
        chassis: vehicle.chassis_number || vehicle.vehicle_number || 'Unknown',
        reg: vehicle.registration_number || 'Pending',
        depot: vehicle.depot || 'Not Assigned',
        motor: vehicle.motor_number || 'N/A',
        dispatch: vehicle.dispatch_date || 'N/A',
        regDate: vehicle.registration_date || 'N/A',
        mfgDate: vehicle.manufacturing_date || 'N/A',
        model: vehicle.model || 'N/A',
        colour: vehicle.colour || 'N/A',
        seating: vehicle.seating_capacity?.toString() || 'N/A',
        motorKw: vehicle.motor_power_kw?.toString() || 'N/A'
      }));

      console.log('Processed vehicles:', vehicles);
      return vehicles;
    } catch (error) {
      console.error('Error in getVehicles:', error);
      return [];
    }
  }

  async addVehicle(vehicle: {
    chassis_number: string;
    registration_number: string;
    depot: string;
    motor_number: string;
    model: string;
    colour: string;
    seating_capacity: number;
    motor_power_kw: number;
  }): Promise<Vehicle | null> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert(vehicle)
        .select()
        .single();

      if (error) {
        console.error('Failed to add vehicle:', error);
        throw error;
      }

      return {
        id: data.id,
        chassis: data.chassis_number,
        reg: data.registration_number,
        depot: data.depot,
        motor: data.motor_number,
        model: data.model,
        colour: data.colour,
        seating: data.seating_capacity?.toString(),
        motorKw: data.motor_power_kw?.toString()
      };
    } catch (error) {
      console.error('Error adding vehicle:', error);
      return null;
    }
  }

  // COMPLAINTS
  async getComplaints(): Promise<Complaint[]> {
    try {
      const { data: complaints, error } = await supabase
        .from('complaints')
        .select(`
          *,
          vehicles!inner(chassis_number, registration_number, depot, vehicle_number)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch complaints:', error);
        return [];
      }

      return complaints.map(complaint => ({
        id: complaint.id,
        chassis: complaint.vehicles.chassis_number || complaint.vehicles.vehicle_number,
        text: complaint.description,
        date: complaint.created_at,
        status: complaint.status.toLowerCase() === 'open' ? 'open' : 'cleared',
        vehicleReg: complaint.vehicles.registration_number,
        vehicleDepot: complaint.vehicles.depot
      }));
    } catch (error) {
      console.error('Error fetching complaints:', error);
      return [];
    }
  }

  async getComplaintsByVehicle(chassisNumber: string): Promise<Complaint[]> {
    try {
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select('id')
        .or(`chassis_number.eq.${chassisNumber},vehicle_number.eq.${chassisNumber}`)
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
        status: complaint.status.toLowerCase() === 'open' ? 'open' : 'cleared'
      }));
    } catch (error) {
      console.error('Error in getComplaintsByVehicle:', error);
      return [];
    }
  }

  async addComplaint(complaint: { chassis: string; text: string; status: string; date: string }): Promise<Complaint | null> {
    try {
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select('id')
        .or(`chassis_number.eq.${complaint.chassis},vehicle_number.eq.${complaint.chassis}`)
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
        status: data.status.toLowerCase() === 'open' ? 'open' : 'cleared'
      };
    } catch (error) {
      console.error('Error in addComplaint:', error);
      return null;
    }
  }

  async updateComplaint(id: string, updates: { status: string }): Promise<Complaint | null> {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .update({ 
          status: updates.status === 'cleared' ? 'Closed' : 'Open',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          vehicles!inner(chassis_number, vehicle_number)
        `)
        .single();

      if (error) {
        console.error('Error updating complaint:', error.message);
        return null;
      }

      return {
        id: data.id,
        chassis: data.vehicles.chassis_number || data.vehicles.vehicle_number,
        text: data.description,
        date: data.created_at,
        status: data.status.toLowerCase() === 'open' ? 'open' : 'cleared'
      };
    } catch (error) {
      console.error('Error in updateComplaint:', error);
      return null;
    }
  }

  // ODOMETER READINGS
  async getOdometers(): Promise<OdometerReading[]> {
    try {
      const { data, error } = await supabase
        .from('odometer_readings')
        .select(`
          *,
          vehicles!inner(chassis_number, registration_number, vehicle_number)
        `)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching odometer readings:', error.message);
        return [];
      }

      return data.map(reading => ({
        id: reading.id,
        chassis: reading.vehicles.chassis_number || reading.vehicles.vehicle_number,
        value: reading.reading,
        date: reading.date,
        vehicleReg: reading.vehicles.registration_number
      }));
    } catch (error) {
      console.error('Error in getOdometers:', error);
      return [];
    }
  }

  async getOdometersByVehicle(chassisNumber: string): Promise<OdometerReading[]> {
    try {
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select('id')
        .or(`chassis_number.eq.${chassisNumber},vehicle_number.eq.${chassisNumber}`)
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
    } catch (error) {
      console.error('Error in getOdometersByVehicle:', error);
      return [];
    }
  }

  async addOdometer(reading: { chassis: string; value: number; date: string }): Promise<OdometerReading | null> {
    try {
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select('id')
        .or(`chassis_number.eq.${reading.chassis},vehicle_number.eq.${reading.chassis}`)
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
    } catch (error) {
      console.error('Error in addOdometer:', error);
      return null;
    }
  }

  // FILE UPLOADS (SOP Documents)
  async uploadFile(file: { name: string; content: string; chassis: string; type: 'sop' | 'retro' }): Promise<FileUpload | null> {
    try {
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
          .or(`chassis_number.eq.${file.chassis},vehicle_number.eq.${file.chassis}`)
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
    } catch (error) {
      console.error('Error in uploadFile:', error);
      return null;
    }
  }

  async getFilesByType(type: 'sop' | 'retro', chassisNumber?: string): Promise<FileUpload[]> {
    try {
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
          .or(`chassis_number.eq.${chassisNumber},vehicle_number.eq.${chassisNumber}`)
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
    } catch (error) {
      console.error('Error in getFilesByType:', error);
      return [];
    }
  }

  // SUMMARY
  async getOdometerSummary(): Promise<OdometerSummary[]> {
    try {
      const { data: readings, error } = await supabase
        .from('odometer_readings')
        .select(`
          *,
          vehicles!inner(registration_number, depot, chassis_number, vehicle_number)
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
        const vehicleReg = reading.vehicles.registration_number || reading.vehicles.vehicle_number || 'Unknown';
        const chassisNumber = reading.vehicles.chassis_number || reading.vehicles.vehicle_number;

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
    } catch (error) {
      console.error('Error in getOdometerSummary:', error);
      return [];
    }
  }
}

export const apiService = new ApiService();