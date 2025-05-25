import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Auth from "./components/Auth";
// We will create this component next
import Dashboard from "./components/Dashboard";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/auth" element={<Auth />} />
        {/* We will create the Dashboard component and add its route here */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}