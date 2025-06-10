import { Vehicle, Complaint, OdometerReading, FileUpload, OdometerSummary } from '../types';

// Mock API service - replace with actual API calls
class ApiService {
  private baseUrl = 'http://localhost:5000/api';

  // Updated mock data with 50 buses from the Excel file
  private mockVehicles: Vehicle[] = [
    {
      chassis: "ME9MEBA0032482141AL",
      reg: "KA51AL0084",
      depot: "Depot A",
      motor: "M123",
      dispatch: "2024-01-01",
      regDate: "2024-01-02",
      mfgDate: "2023-12-15",
      model: "EV Coach",
      colour: "White",
      seating: "40",
      motorKw: "200"
    },
    {
      chassis: "ME9MEBA0032482141BL",
      reg: "KA51AL0085",
      depot: "Depot B",
      motor: "M124",
      dispatch: "2024-01-05",
      regDate: "2024-01-06",
      mfgDate: "2023-12-20",
      model: "EV Coach",
      colour: "Blue",
      seating: "45",
      motorKw: "220"
    },
    {
      chassis: "ME9MEBA0032482142AL",
      reg: "KA51AL0086",
      depot: "Depot A",
      motor: "M125",
      dispatch: "2024-01-10",
      regDate: "2024-01-11",
      mfgDate: "2023-12-25",
      model: "EV Coach",
      colour: "White",
      seating: "40",
      motorKw: "200"
    },
    {
      chassis: "ME9MEBA0032482143AL",
      reg: "KA51AL0087",
      depot: "Depot C",
      motor: "M126",
      dispatch: "2024-01-15",
      regDate: "2024-01-16",
      mfgDate: "2023-12-30",
      model: "EV Coach",
      colour: "Green",
      seating: "42",
      motorKw: "210"
    },
    {
      chassis: "ME9MEBA0032482144AL",
      reg: "KA51AL0088",
      depot: "Depot B",
      motor: "M127",
      dispatch: "2024-01-20",
      regDate: "2024-01-21",
      mfgDate: "2024-01-05",
      model: "EV Coach",
      colour: "Blue",
      seating: "45",
      motorKw: "220"
    },
    {
      chassis: "ME9MEBA0032482145AL",
      reg: "KA51AL0089",
      depot: "Depot A",
      motor: "M128",
      dispatch: "2024-01-25",
      regDate: "2024-01-26",
      mfgDate: "2024-01-10",
      model: "EV Coach",
      colour: "White",
      seating: "40",
      motorKw: "200"
    },
    {
      chassis: "ME9MEBA0032482146AL",
      reg: "KA51AL0090",
      depot: "Depot D",
      motor: "M129",
      dispatch: "2024-02-01",
      regDate: "2024-02-02",
      mfgDate: "2024-01-15",
      model: "EV Coach",
      colour: "Red",
      seating: "38",
      motorKw: "195"
    },
    {
      chassis: "ME9MEBA0032482147AL",
      reg: "KA51AL0091",
      depot: "Depot C",
      motor: "M130",
      dispatch: "2024-02-05",
      regDate: "2024-02-06",
      mfgDate: "2024-01-20",
      model: "EV Coach",
      colour: "Green",
      seating: "42",
      motorKw: "210"
    },
    {
      chassis: "ME9MEBA0032482148AL",
      reg: "KA51AL0092",
      depot: "Depot B",
      motor: "M131",
      dispatch: "2024-02-10",
      regDate: "2024-02-11",
      mfgDate: "2024-01-25",
      model: "EV Coach",
      colour: "Blue",
      seating: "45",
      motorKw: "220"
    },
    {
      chassis: "ME9MEBA0032482149AL",
      reg: "KA51AL0093",
      depot: "Depot A",
      motor: "M132",
      dispatch: "2024-02-15",
      regDate: "2024-02-16",
      mfgDate: "2024-01-30",
      model: "EV Coach",
      colour: "White",
      seating: "40",
      motorKw: "200"
    },
    {
      chassis: "ME9MEBA0032482150AL",
      reg: "TN33AL0001",
      depot: "Chennai Depot",
      motor: "M133",
      dispatch: "2024-02-20",
      regDate: "2024-02-21",
      mfgDate: "2024-02-05",
      model: "EV Coach",
      colour: "Yellow",
      seating: "44",
      motorKw: "215"
    },
    {
      chassis: "ME9MEBA0032482151AL",
      reg: "TN33AL0002",
      depot: "Chennai Depot",
      motor: "M134",
      dispatch: "2024-02-25",
      regDate: "2024-02-26",
      mfgDate: "2024-02-10",
      model: "EV Coach",
      colour: "Yellow",
      seating: "44",
      motorKw: "215"
    },
    {
      chassis: "ME9MEBA0032482152AL",
      reg: "TN33AL0003",
      depot: "Chennai Depot",
      motor: "M135",
      dispatch: "2024-03-01",
      regDate: "2024-03-02",
      mfgDate: "2024-02-15",
      model: "EV Coach",
      colour: "Yellow",
      seating: "44",
      motorKw: "215"
    },
    {
      chassis: "ME9MEBA0032482153AL",
      reg: "AP28AL0001",
      depot: "Hyderabad Depot",
      motor: "M136",
      dispatch: "2024-03-05",
      regDate: "2024-03-06",
      mfgDate: "2024-02-20",
      model: "EV Coach",
      colour: "Orange",
      seating: "46",
      motorKw: "225"
    },
    {
      chassis: "ME9MEBA0032482154AL",
      reg: "AP28AL0002",
      depot: "Hyderabad Depot",
      motor: "M137",
      dispatch: "2024-03-10",
      regDate: "2024-03-11",
      mfgDate: "2024-02-25",
      model: "EV Coach",
      colour: "Orange",
      seating: "46",
      motorKw: "225"
    },
    {
      chassis: "ME9MEBA0032482155AL",
      reg: "RJ14AL0001",
      depot: "Jaipur Depot",
      motor: "M138",
      dispatch: "2024-03-15",
      regDate: "2024-03-16",
      mfgDate: "2024-03-01",
      model: "EV Coach",
      colour: "Pink",
      seating: "41",
      motorKw: "205"
    },
    {
      chassis: "ME9MEBA0032482156AL",
      reg: "RJ14AL0002",
      depot: "Jaipur Depot",
      motor: "M139",
      dispatch: "2024-03-20",
      regDate: "2024-03-21",
      mfgDate: "2024-03-05",
      model: "EV Coach",
      colour: "Pink",
      seating: "41",
      motorKw: "205"
    },
    {
      chassis: "ME9MEBA0032482157AL",
      reg: "KA51AL0094",
      depot: "Depot E",
      motor: "M140",
      dispatch: "2024-03-25",
      regDate: "2024-03-26",
      mfgDate: "2024-03-10",
      model: "EV Coach",
      colour: "Silver",
      seating: "43",
      motorKw: "212"
    },
    {
      chassis: "ME9MEBA0032482158AL",
      reg: "KA51AL0095",
      depot: "Depot E",
      motor: "M141",
      dispatch: "2024-03-30",
      regDate: "2024-03-31",
      mfgDate: "2024-03-15",
      model: "EV Coach",
      colour: "Silver",
      seating: "43",
      motorKw: "212"
    },
    {
      chassis: "ME9MEBA0032482159AL",
      reg: "KA51AL0096",
      depot: "Depot F",
      motor: "M142",
      dispatch: "2024-04-05",
      regDate: "2024-04-06",
      mfgDate: "2024-03-20",
      model: "EV Coach",
      colour: "Black",
      seating: "39",
      motorKw: "190"
    },
    {
      chassis: "ME9MEBA0032482160AL",
      reg: "KA51AL0097",
      depot: "Depot F",
      motor: "M143",
      dispatch: "2024-04-10",
      regDate: "2024-04-11",
      mfgDate: "2024-03-25",
      model: "EV Coach",
      colour: "Black",
      seating: "39",
      motorKw: "190"
    },
    {
      chassis: "ME9MEBA0032482161AL",
      reg: "TN33AL0004",
      depot: "Coimbatore Depot",
      motor: "M144",
      dispatch: "2024-04-15",
      regDate: "2024-04-16",
      mfgDate: "2024-03-30",
      model: "EV Coach",
      colour: "Maroon",
      seating: "47",
      motorKw: "230"
    },
    {
      chassis: "ME9MEBA0032482162AL",
      reg: "TN33AL0005",
      depot: "Coimbatore Depot",
      motor: "M145",
      dispatch: "2024-04-20",
      regDate: "2024-04-21",
      mfgDate: "2024-04-05",
      model: "EV Coach",
      colour: "Maroon",
      seating: "47",
      motorKw: "230"
    },
    {
      chassis: "ME9MEBA0032482163AL",
      reg: "AP28AL0003",
      depot: "Vijayawada Depot",
      motor: "M146",
      dispatch: "2024-04-25",
      regDate: "2024-04-26",
      mfgDate: "2024-04-10",
      model: "EV Coach",
      colour: "Navy",
      seating: "48",
      motorKw: "235"
    },
    {
      chassis: "ME9MEBA0032482164AL",
      reg: "AP28AL0004",
      depot: "Vijayawada Depot",
      motor: "M147",
      dispatch: "2024-04-30",
      regDate: "2024-05-01",
      mfgDate: "2024-04-15",
      model: "EV Coach",
      colour: "Navy",
      seating: "48",
      motorKw: "235"
    },
    {
      chassis: "ME9MEBA0032482165AL",
      reg: "RJ14AL0003",
      depot: "Udaipur Depot",
      motor: "M148",
      dispatch: "2024-05-05",
      regDate: "2024-05-06",
      mfgDate: "2024-04-20",
      model: "EV Coach",
      colour: "Cream",
      seating: "37",
      motorKw: "185"
    },
    {
      chassis: "ME9MEBA0032482166AL",
      reg: "RJ14AL0004",
      depot: "Udaipur Depot",
      motor: "M149",
      dispatch: "2024-05-10",
      regDate: "2024-05-11",
      mfgDate: "2024-04-25",
      model: "EV Coach",
      colour: "Cream",
      seating: "37",
      motorKw: "185"
    },
    {
      chassis: "ME9MEBA0032482167AL",
      reg: "KA51AL0098",
      depot: "Depot G",
      motor: "M150",
      dispatch: "2024-05-15",
      regDate: "2024-05-16",
      mfgDate: "2024-04-30",
      model: "EV Coach",
      colour: "Purple",
      seating: "49",
      motorKw: "240"
    },
    {
      chassis: "ME9MEBA0032482168AL",
      reg: "KA51AL0099",
      depot: "Depot G",
      motor: "M151",
      dispatch: "2024-05-20",
      regDate: "2024-05-21",
      mfgDate: "2024-05-05",
      model: "EV Coach",
      colour: "Purple",
      seating: "49",
      motorKw: "240"
    },
    {
      chassis: "ME9MEBA0032482169AL",
      reg: "KA51AL0100",
      depot: "Depot H",
      motor: "M152",
      dispatch: "2024-05-25",
      regDate: "2024-05-26",
      mfgDate: "2024-05-10",
      model: "EV Coach",
      colour: "Teal",
      seating: "36",
      motorKw: "180"
    },
    {
      chassis: "ME9MEBA0032482170AL",
      reg: "TN33AL0006",
      depot: "Madurai Depot",
      motor: "M153",
      dispatch: "2024-05-30",
      regDate: "2024-05-31",
      mfgDate: "2024-05-15",
      model: "EV Coach",
      colour: "Lime",
      seating: "50",
      motorKw: "245"
    },
    {
      chassis: "ME9MEBA0032482171AL",
      reg: "TN33AL0007",
      depot: "Madurai Depot",
      motor: "M154",
      dispatch: "2024-06-05",
      regDate: "2024-06-06",
      mfgDate: "2024-05-20",
      model: "EV Coach",
      colour: "Lime",
      seating: "50",
      motorKw: "245"
    },
    {
      chassis: "ME9MEBA0032482172AL",
      reg: "AP28AL0005",
      depot: "Visakhapatnam Depot",
      motor: "M155",
      dispatch: "2024-06-10",
      regDate: "2024-06-11",
      mfgDate: "2024-05-25",
      model: "EV Coach",
      colour: "Coral",
      seating: "35",
      motorKw: "175"
    },
    {
      chassis: "ME9MEBA0032482173AL",
      reg: "AP28AL0006",
      depot: "Visakhapatnam Depot",
      motor: "M156",
      dispatch: "2024-06-15",
      regDate: "2024-06-16",
      mfgDate: "2024-05-30",
      model: "EV Coach",
      colour: "Coral",
      seating: "35",
      motorKw: "175"
    },
    {
      chassis: "ME9MEBA0032482174AL",
      reg: "RJ14AL0005",
      depot: "Jodhpur Depot",
      motor: "M157",
      dispatch: "2024-06-20",
      regDate: "2024-06-21",
      mfgDate: "2024-06-05",
      model: "EV Coach",
      colour: "Gold",
      seating: "51",
      motorKw: "250"
    },
    {
      chassis: "ME9MEBA0032482175AL",
      reg: "RJ14AL0006",
      depot: "Jodhpur Depot",
      motor: "M158",
      dispatch: "2024-06-25",
      regDate: "2024-06-26",
      mfgDate: "2024-06-10",
      model: "EV Coach",
      colour: "Gold",
      seating: "51",
      motorKw: "250"
    },
    {
      chassis: "ME9MEBA0032482176AL",
      reg: "KA51AL0101",
      depot: "Depot I",
      motor: "M159",
      dispatch: "2024-06-30",
      regDate: "2024-07-01",
      mfgDate: "2024-06-15",
      model: "EV Coach",
      colour: "Magenta",
      seating: "34",
      motorKw: "170"
    },
    {
      chassis: "ME9MEBA0032482177AL",
      reg: "KA51AL0102",
      depot: "Depot I",
      motor: "M160",
      dispatch: "2024-07-05",
      regDate: "2024-07-06",
      mfgDate: "2024-06-20",
      model: "EV Coach",
      colour: "Magenta",
      seating: "34",
      motorKw: "170"
    },
    {
      chassis: "ME9MEBA0032482178AL",
      reg: "TN33AL0008",
      depot: "Salem Depot",
      motor: "M161",
      dispatch: "2024-07-10",
      regDate: "2024-07-11",
      mfgDate: "2024-06-25",
      model: "EV Coach",
      colour: "Cyan",
      seating: "52",
      motorKw: "255"
    },
    {
      chassis: "ME9MEBA0032482179AL",
      reg: "TN33AL0009",
      depot: "Salem Depot",
      motor: "M162",
      dispatch: "2024-07-15",
      regDate: "2024-07-16",
      mfgDate: "2024-06-30",
      model: "EV Coach",
      colour: "Cyan",
      seating: "52",
      motorKw: "255"
    },
    {
      chassis: "ME9MEBA0032482180AL",
      reg: "AP28AL0007",
      depot: "Tirupati Depot",
      motor: "M163",
      dispatch: "2024-07-20",
      regDate: "2024-07-21",
      mfgDate: "2024-07-05",
      model: "EV Coach",
      colour: "Indigo",
      seating: "33",
      motorKw: "165"
    },
    {
      chassis: "ME9MEBA0032482181AL",
      reg: "AP28AL0008",
      depot: "Tirupati Depot",
      motor: "M164",
      dispatch: "2024-07-25",
      regDate: "2024-07-26",
      mfgDate: "2024-07-10",
      model: "EV Coach",
      colour: "Indigo",
      seating: "33",
      motorKw: "165"
    },
    {
      chassis: "ME9MEBA0032482182AL",
      reg: "RJ14AL0007",
      depot: "Bikaner Depot",
      motor: "M165",
      dispatch: "2024-07-30",
      regDate: "2024-07-31",
      mfgDate: "2024-07-15",
      model: "EV Coach",
      colour: "Olive",
      seating: "53",
      motorKw: "260"
    },
    {
      chassis: "ME9MEBA0032482183AL",
      reg: "RJ14AL0008",
      depot: "Bikaner Depot",
      motor: "M166",
      dispatch: "2024-08-05",
      regDate: "2024-08-06",
      mfgDate: "2024-07-20",
      model: "EV Coach",
      colour: "Olive",
      seating: "53",
      motorKw: "260"
    },
    {
      chassis: "ME9MEBA0032482184AL",
      reg: "KA51AL0103",
      depot: "Depot J",
      motor: "M167",
      dispatch: "2024-08-10",
      regDate: "2024-08-11",
      mfgDate: "2024-07-25",
      model: "EV Coach",
      colour: "Beige",
      seating: "32",
      motorKw: "160"
    },
    {
      chassis: "ME9MEBA0032482185AL",
      reg: "KA51AL0104",
      depot: "Depot J",
      motor: "M168",
      dispatch: "2024-08-15",
      regDate: "2024-08-16",
      mfgDate: "2024-07-30",
      model: "EV Coach",
      colour: "Beige",
      seating: "32",
      motorKw: "160"
    },
    {
      chassis: "ME9MEBA0032482186AL",
      reg: "TN33AL0010",
      depot: "Trichy Depot",
      motor: "M169",
      dispatch: "2024-08-20",
      regDate: "2024-08-21",
      mfgDate: "2024-08-05",
      model: "EV Coach",
      colour: "Turquoise",
      seating: "54",
      motorKw: "265"
    },
    {
      chassis: "ME9MEBA0032482187AL",
      reg: "TN33AL0011",
      depot: "Trichy Depot",
      motor: "M170",
      dispatch: "2024-08-25",
      regDate: "2024-08-26",
      mfgDate: "2024-08-10",
      model: "EV Coach",
      colour: "Turquoise",
      seating: "54",
      motorKw: "265"
    },
    {
      chassis: "ME9MEBA0032482188AL",
      reg: "AP28AL0009",
      depot: "Guntur Depot",
      motor: "M171",
      dispatch: "2024-08-30",
      regDate: "2024-08-31",
      mfgDate: "2024-08-15",
      model: "EV Coach",
      colour: "Lavender",
      seating: "31",
      motorKw: "155"
    },
    {
      chassis: "ME9MEBA0032482189AL",
      reg: "AP28AL0010",
      depot: "Guntur Depot",
      motor: "M172",
      dispatch: "2024-09-05",
      regDate: "2024-09-06",
      mfgDate: "2024-08-20",
      model: "EV Coach",
      colour: "Lavender",
      seating: "31",
      motorKw: "155"
    },
    {
      chassis: "ME9MEBA0032482190AL",
      reg: "RJ14AL0009",
      depot: "Kota Depot",
      motor: "M173",
      dispatch: "2024-09-10",
      regDate: "2024-09-11",
      mfgDate: "2024-08-25",
      model: "EV Coach",
      colour: "Peach",
      seating: "55",
      motorKw: "270"
    },
    {
      chassis: "ME9MEBA0032482191AL",
      reg: "RJ14AL0010",
      depot: "Kota Depot",
      motor: "M174",
      dispatch: "2024-09-15",
      regDate: "2024-09-16",
      mfgDate: "2024-08-30",
      model: "EV Coach",
      colour: "Peach",
      seating: "55",
      motorKw: "270"
    }
  ];

  private mockComplaints: Complaint[] = [
    {
      id: '1',
      chassis: "ME9MEBA0032482141AL",
      text: "AC not working properly",
      date: "2024-01-15",
      status: 'open'
    },
    {
      id: '2',
      chassis: "ME9MEBA0032482141BL",
      text: "Battery charging issue",
      date: "2024-01-10",
      status: 'cleared'
    },
    {
      id: '3',
      chassis: "ME9MEBA0032482142AL",
      text: "Door mechanism fault",
      date: "2024-02-01",
      status: 'open'
    },
    {
      id: '4',
      chassis: "ME9MEBA0032482150AL",
      text: "Brake system needs adjustment",
      date: "2024-02-15",
      status: 'cleared'
    },
    {
      id: '5',
      chassis: "ME9MEBA0032482153AL",
      text: "Display panel malfunction",
      date: "2024-03-01",
      status: 'open'
    }
  ];

  private mockOdometers: OdometerReading[] = [
    {
      id: '1',
      chassis: "ME9MEBA0032482141AL",
      value: 15250,
      date: "2024-01-15"
    },
    {
      id: '2',
      chassis: "ME9MEBA0032482141BL",
      value: 18750,
      date: "2024-01-14"
    },
    {
      id: '3',
      chassis: "ME9MEBA0032482142AL",
      value: 12500,
      date: "2024-02-01"
    },
    {
      id: '4',
      chassis: "ME9MEBA0032482143AL",
      value: 9800,
      date: "2024-02-10"
    },
    {
      id: '5',
      chassis: "ME9MEBA0032482144AL",
      value: 22100,
      date: "2024-02-15"
    },
    {
      id: '6',
      chassis: "ME9MEBA0032482150AL",
      value: 8500,
      date: "2024-03-01"
    },
    {
      id: '7',
      chassis: "ME9MEBA0032482153AL",
      value: 14200,
      date: "2024-03-10"
    },
    {
      id: '8',
      chassis: "ME9MEBA0032482155AL",
      value: 6750,
      date: "2024-03-20"
    },
    {
      id: '9',
      chassis: "ME9MEBA0032482160AL",
      value: 11900,
      date: "2024-04-15"
    },
    {
      id: '10',
      chassis: "ME9MEBA0032482165AL",
      value: 16800,
      date: "2024-05-01"
    }
  ];

  private mockFiles: FileUpload[] = [];

  async getVehicles(): Promise<Vehicle[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.mockVehicles;
  }

  async getComplaints(): Promise<Complaint[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mockComplaints;
  }

  async getComplaintsByVehicle(chassis: string): Promise<Complaint[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mockComplaints.filter(c => c.chassis === chassis);
  }

  async addComplaint(complaint: Omit<Complaint, 'id'>): Promise<Complaint> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newComplaint = { ...complaint, id: Date.now().toString() };
    this.mockComplaints.push(newComplaint);
    return newComplaint;
  }

  async updateComplaint(id: string, updates: Partial<Complaint>): Promise<Complaint> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = this.mockComplaints.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Complaint not found');
    this.mockComplaints[index] = { ...this.mockComplaints[index], ...updates };
    return this.mockComplaints[index];
  }

  async getOdometers(): Promise<OdometerReading[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mockOdometers;
  }

  async getOdometersByVehicle(chassis: string): Promise<OdometerReading[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mockOdometers.filter(o => o.chassis === chassis);
  }

  async addOdometer(reading: Omit<OdometerReading, 'id'>): Promise<OdometerReading> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newReading = { ...reading, id: Date.now().toString() };
    this.mockOdometers.push(newReading);
    return newReading;
  }

  async getOdometerSummary(): Promise<OdometerSummary[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const vehicles = await this.getVehicles();
    const odometers = await this.getOdometers();
    
    const depotSummary = vehicles.reduce((acc, vehicle) => {
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
        .filter(o => o.chassis === vehicle.chassis)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      if (latestReading) {
        acc[depot].totalOdometer += latestReading.value;
        acc[depot].vehicles.push({
          reg: vehicle.reg || 'Unknown',
          lastReading: latestReading.value,
          date: latestReading.date
        });
      } else {
        // Add vehicles without odometer readings with 0 km
        acc[depot].vehicles.push({
          reg: vehicle.reg || 'Unknown',
          lastReading: 0,
          date: new Date().toISOString()
        });
      }
      
      acc[depot].vehicleCount = acc[depot].vehicles.length;
      return acc;
    }, {} as Record<string, OdometerSummary>);
    
    return Object.values(depotSummary);
  }

  async uploadFile(file: Omit<FileUpload, 'id' | 'uploadDate'>): Promise<FileUpload> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newFile = {
      ...file,
      id: Date.now().toString(),
      uploadDate: new Date().toISOString()
    };
    this.mockFiles.push(newFile);
    return newFile;
  }

  async getFilesByType(type: 'sop' | 'retro', chassis?: string): Promise<FileUpload[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mockFiles.filter(f => 
      f.type === type && (chassis ? f.chassis === chassis : true)
    );
  }
}

export const apiService = new ApiService();