import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DoctorLoginForm from './doctorLoginForm';
import ProfileDoctor from './profileDoctor';
import UpdateDoctor from './UpdateProfilePage';
// import HosoPage from './HosoPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<DoctorLoginForm />} />
      {/* <Route path="/hoso/:username" element={<HosoPage />} /> */}
      <Route path="/profileDoctor/:username" element={<ProfileDoctor />} />
      <Route path="/updateDoctor/:username" element={<UpdateDoctor />} />
    </Routes>
  );
}

export default App;
