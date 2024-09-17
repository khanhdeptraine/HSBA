import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DoctorLoginForm from './doctorLoginForm';
import ProfileDoctor from './profileDoctor';
import UpdateDoctor from './UpdateProfilePage';
import HosoPage from './HosoPage';
import ProfilePatient from './profilePatient'; // Ensure this import matches the file name
import AddPatientRecord from './AddPatientRecord';
import NewRecord from './newRecord';

function App() {
  return (
    <Routes>
      <Route path="/" element={<DoctorLoginForm />} />
      <Route path="/hoso/:username" element={<HosoPage />} />
      <Route path="/profileDoctor/:username" element={<ProfileDoctor />} />
      <Route path="/updateDoctor/:username" element={<UpdateDoctor />} />
      <Route path="/profilePatient/:patientAddress" element={<ProfilePatient />} /> {/* Add this route */}
      <Route path="/addpatientrecord/:username" element={<AddPatientRecord />} />
      <Route path="/newRecord" element={<NewRecord />} />
    </Routes>
  );
}

export default App;
