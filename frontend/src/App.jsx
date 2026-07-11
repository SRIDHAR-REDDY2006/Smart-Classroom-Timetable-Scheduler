import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Faculty from './components/Faculty';
import Subjects from './components/Subjects';
import Classes from './components/Classes';
import Branches from './components/Branches';
import TimeSlots from './components/TimeSlots';
import TimeTables from './components/TimeTables';
import Approval from './components/Approval';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return <Navigate to="/login" />;
    }
  } catch {
    return <Navigate to="/login" />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="faculty" element={<Faculty />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="classes" element={<Classes />} />
          <Route path="branches" element={<Branches />} />
          <Route path="timeslots" element={<TimeSlots />} />
          <Route path="timetables" element={<TimeTables />} />
          <Route path="approval" element={<Approval />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
