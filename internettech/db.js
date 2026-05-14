// =============================================
// db.js — JSON File Database
// =============================================

const fs    = require('fs');
const path  = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, 'data.json');

// ─── Read / Write ─────────────────────────────
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const fresh = seed();
    writeDB(fresh);
    return fresh;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ─── Generic Helpers ──────────────────────────
function nextId(collection) {
  return collection.length === 0 ? 1 : Math.max(...collection.map(r => r.id)) + 1;
}

function now() {
  return new Date().toISOString();
}

// ─── Seed Data ────────────────────────────────
function seed() {
  const users = [
    {
      id: 1, role: 'admin',
      name: 'Admin User',
      email: 'admin@vetclinic.com',
      password: bcrypt.hashSync('Admin123', 10),
      specialization: null, phone: '+48 61 870 11 07',
      created_at: now()
    },
    {
      id: 2, role: 'doctor',
      name: 'Dr. Alexander Webb',
      email: 'dr.webb@vetclinic.com',
      password: bcrypt.hashSync('Doctor123', 10),
      specialization: 'Veterinary Surgeon', phone: '+48 730 100 031',
      created_at: now()
    },
    {
      id: 3, role: 'doctor',
      name: 'Dr. Olivia Bennett',
      email: 'dr.bennett@vetclinic.com',
      password: bcrypt.hashSync('Doctor123', 10),
      specialization: 'Dermatology Specialist', phone: '+48 730 100 032',
      created_at: now()
    },
    {
      id: 4, role: 'doctor',
      name: 'Dr. James Carter',
      email: 'dr.carter@vetclinic.com',
      password: bcrypt.hashSync('Doctor123', 10),
      specialization: 'Cardiology Expert', phone: '+48 730 100 033',
      created_at: now()
    },
    {
      id: 5, role: 'receptionist',
      name: 'Sophie Miller',
      email: 'reception@vetclinic.com',
      password: bcrypt.hashSync('Recep123', 10),
      specialization: null, phone: '+48 730 100 034',
      created_at: now()
    }
  ];

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const nextWeek  = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const patients = [
    { id: 1, name: 'Max',     species: 'Dog', breed: 'Golden Retriever', age: 5,   weight: 28.5, owner_name: 'John Smith',    owner_phone: '+48 600 100 001', owner_email: 'john@example.com',   owner_address: 'ul. Długa 12, Poznań',   notes: 'Friendly, no known allergies', created_at: now() },
    { id: 2, name: 'Luna',    species: 'Cat', breed: 'Persian',           age: 3,   weight: 4.2,  owner_name: 'Emma Johnson',  owner_phone: '+48 600 100 002', owner_email: 'emma@example.com',   owner_address: 'ul. Krótka 5, Poznań',   notes: 'Indoor cat, prone to hairballs', created_at: now() },
    { id: 3, name: 'Charlie', species: 'Dog', breed: 'German Shepherd',   age: 7,   weight: 35.0, owner_name: 'Michael Brown', owner_phone: '+48 600 100 003', owner_email: 'michael@example.com', owner_address: 'ul. Nowa 8, Poznań',     notes: 'Previous knee surgery 2022', created_at: now() },
    { id: 4, name: 'Bella',   species: 'Cat', breed: 'Siamese',           age: 2,   weight: 3.8,  owner_name: 'Sarah Davis',   owner_phone: '+48 600 100 004', owner_email: 'sarah@example.com',  owner_address: 'ul. Szeroka 3, Poznań',  notes: 'Vaccinations up to date', created_at: now() },
    { id: 5, name: 'Rocky',   species: 'Dog', breed: 'Labrador',          age: 4,   weight: 32.0, owner_name: 'James Wilson',  owner_phone: '+48 600 100 005', owner_email: 'james@example.com',  owner_address: 'ul. Stara 21, Poznań',   notes: 'Mild hip dysplasia, monitor', created_at: now() },
    { id: 6, name: 'Milo',    species: 'Rabbit', breed: 'Holland Lop',    age: 1.5, weight: 1.8,  owner_name: 'Anna Kowalski', owner_phone: '+48 600 100 006', owner_email: 'anna@example.com',   owner_address: 'ul. Polna 14, Poznań',   notes: 'First visit', created_at: now() }
  ];

  const appointments = [
    { id: 1,  patient_id: 1, doctor_id: 2, date: yesterday, time: '09:00', status: 'completed', reason: 'Annual checkup',        notes: 'All good', created_by: 5, created_at: now() },
    { id: 2,  patient_id: 2, doctor_id: 3, date: yesterday, time: '10:30', status: 'completed', reason: 'Skin irritation',        notes: '',         created_by: 5, created_at: now() },
    { id: 3,  patient_id: 3, doctor_id: 2, date: yesterday, time: '14:00', status: 'completed', reason: 'Post-surgery follow-up', notes: '',         created_by: 5, created_at: now() },
    { id: 4,  patient_id: 1, doctor_id: 2, date: today,     time: '09:00', status: 'confirmed', reason: 'Vaccination booster',   notes: '',         created_by: 5, created_at: now() },
    { id: 5,  patient_id: 4, doctor_id: 3, date: today,     time: '10:00', status: 'confirmed', reason: 'General checkup',       notes: '',         created_by: 5, created_at: now() },
    { id: 6,  patient_id: 5, doctor_id: 2, date: today,     time: '11:00', status: 'pending',   reason: 'Hip pain assessment',   notes: '',         created_by: 5, created_at: now() },
    { id: 7,  patient_id: 6, doctor_id: 4, date: today,     time: '14:00', status: 'confirmed', reason: 'First visit / wellness', notes: '',        created_by: 5, created_at: now() },
    { id: 8,  patient_id: 2, doctor_id: 3, date: tomorrow,  time: '09:30', status: 'pending',   reason: 'Follow-up skin check',  notes: '',         created_by: 5, created_at: now() },
    { id: 9,  patient_id: 3, doctor_id: 2, date: tomorrow,  time: '11:00', status: 'pending',   reason: 'X-ray review',          notes: '',         created_by: 5, created_at: now() },
    { id: 10, patient_id: 5, doctor_id: 4, date: nextWeek,  time: '10:00', status: 'pending',   reason: 'Cardio evaluation',     notes: '',         created_by: 5, created_at: now() }
  ];

  const records = [
    {
      id: 1, appointment_id: 1, patient_id: 1, doctor_id: 2,
      diagnosis: 'Healthy — annual checkup passed',
      treatment: 'No treatment required. Continue current diet.',
      medications: 'None',
      notes: 'Weight stable at 28.5 kg. Teeth cleaning recommended next visit.',
      created_at: now()
    },
    {
      id: 2, appointment_id: 2, patient_id: 2, doctor_id: 3,
      diagnosis: 'Mild allergic dermatitis',
      treatment: 'Topical hydrocortisone cream applied. Dietary adjustment recommended.',
      medications: 'Hydrocortisone 1% cream — apply twice daily for 7 days',
      notes: 'Owner advised to switch to hypoallergenic food. Follow-up in 2 weeks.',
      created_at: now()
    },
    {
      id: 3, appointment_id: 3, patient_id: 3, doctor_id: 2,
      diagnosis: 'Post-operative recovery — satisfactory',
      treatment: 'Physiotherapy exercises prescribed.',
      medications: 'Carprofen 25mg — once daily with food for 14 days',
      notes: 'Knee shows good healing. Light walks only. X-ray in 6 weeks.',
      created_at: now()
    }
  ];

  return { users, patients, appointments, records };
}

// ─── User Operations ──────────────────────────
const Users = {
  all()          { return readDB().users; },
  findById(id)   { return readDB().users.find(u => u.id === Number(id)); },
  findByEmail(e) { return readDB().users.find(u => u.email === e); },
  doctors()      { return readDB().users.filter(u => u.role === 'doctor'); },

  create(data) {
    const db = readDB();
    const user = { id: nextId(db.users), created_at: now(), ...data };
    db.users.push(user);
    writeDB(db);
    return user;
  },

  update(id, data) {
    const db = readDB();
    const idx = db.users.findIndex(u => u.id === Number(id));
    if (idx === -1) return null;
    db.users[idx] = { ...db.users[idx], ...data };
    writeDB(db);
    return db.users[idx];
  },

  delete(id) {
    const db = readDB();
    const idx = db.users.findIndex(u => u.id === Number(id));
    if (idx === -1) return false;
    db.users.splice(idx, 1);
    writeDB(db);
    return true;
  }
};

// ─── Patient Operations ───────────────────────
const Patients = {
  all()        { return readDB().patients; },
  findById(id) { return readDB().patients.find(p => p.id === Number(id)); },

  create(data) {
    const db = readDB();
    const patient = { id: nextId(db.patients), created_at: now(), ...data };
    db.patients.push(patient);
    writeDB(db);
    return patient;
  },

  update(id, data) {
    const db = readDB();
    const idx = db.patients.findIndex(p => p.id === Number(id));
    if (idx === -1) return null;
    db.patients[idx] = { ...db.patients[idx], ...data };
    writeDB(db);
    return db.patients[idx];
  },

  delete(id) {
    const db = readDB();
    const idx = db.patients.findIndex(p => p.id === Number(id));
    if (idx === -1) return false;
    db.patients.splice(idx, 1);
    writeDB(db);
    return true;
  }
};

// ─── Appointment Operations ───────────────────
const Appointments = {
  all()        { return readDB().appointments; },
  findById(id) { return readDB().appointments.find(a => a.id === Number(id)); },
  byDoctor(doctorId)  { return readDB().appointments.filter(a => a.doctor_id === Number(doctorId)); },
  byPatient(patientId){ return readDB().appointments.filter(a => a.patient_id === Number(patientId)); },

  create(data) {
    const db = readDB();
    const appt = { id: nextId(db.appointments), created_at: now(), status: 'pending', ...data };
    db.appointments.push(appt);
    writeDB(db);
    return appt;
  },

  update(id, data) {
    const db = readDB();
    const idx = db.appointments.findIndex(a => a.id === Number(id));
    if (idx === -1) return null;
    db.appointments[idx] = { ...db.appointments[idx], ...data };
    writeDB(db);
    return db.appointments[idx];
  },

  delete(id) {
    const db = readDB();
    const idx = db.appointments.findIndex(a => a.id === Number(id));
    if (idx === -1) return false;
    db.appointments.splice(idx, 1);
    writeDB(db);
    return true;
  }
};

// ─── Medical Record Operations ────────────────
const Records = {
  all()               { return readDB().records; },
  findById(id)        { return readDB().records.find(r => r.id === Number(id)); },
  byDoctor(doctorId)  { return readDB().records.filter(r => r.doctor_id === Number(doctorId)); },
  byPatient(patientId){ return readDB().records.filter(r => r.patient_id === Number(patientId)); },
  byAppointment(apptId){ return readDB().records.find(r => r.appointment_id === Number(apptId)); },

  create(data) {
    const db = readDB();
    const record = { id: nextId(db.records), created_at: now(), ...data };
    db.records.push(record);
    writeDB(db);
    return record;
  },

  update(id, data) {
    const db = readDB();
    const idx = db.records.findIndex(r => r.id === Number(id));
    if (idx === -1) return null;
    db.records[idx] = { ...db.records[idx], ...data };
    writeDB(db);
    return db.records[idx];
  },

  delete(id) {
    const db = readDB();
    const idx = db.records.findIndex(r => r.id === Number(id));
    if (idx === -1) return false;
    db.records.splice(idx, 1);
    writeDB(db);
    return true;
  }
};

// Initialize on first load
readDB();

module.exports = { Users, Patients, Appointments, Records };
