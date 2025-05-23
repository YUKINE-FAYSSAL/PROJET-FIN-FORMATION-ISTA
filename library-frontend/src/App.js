import React from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';

import UnifiedNavbar from './components/Navbar/UnifiedNavbar';
import Accueil from './components/Accueil/Accueil';
import Catalogue from './components/Catalogue/Catalogue';
import Login from './components/Login/Login';

import Dashboard from './components/Admin/Dashboard/Dashboard';
import BooksList from './components/Admin/BooksList/BooksList';
import AddBook from './components/Admin/AddBook/AddBook';
import EditBook from './components/Admin/EditBook/EditBook';
import BesoinsList from './components/Admin/BesoinsList/BesoinsList';
import PretsList from './components/Admin/PretsList/PretsList';
import ReservationsList from './components/Admin/ReservationsList/ReservationsList';
import GestionSecteurs from './components/Admin/GestionSecteurs/GestionSecteurs';

import DemandeBesoin from './components/Stagiaire/DemandeBesoin/DemandeBesoin';
import MesReservations from './components/Stagiaire/MesReservations/MesReservations';
import MesBesoins from './components/Stagiaire/MesBesoins/MesBesoins';
import Profile from './components/Stagiaire/Profile/Profile';
import Settings from './components/Stagiaire/Settings/Settings';

import BookDetails from './components/BookDetails/BookDetails'; // ✅ إضافة BookDetails

function App() {
  return (
    <BrowserRouter>
      <UnifiedNavbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Accueil />} />
        <Route path="/catalogue" element={<Catalogue />} />
        <Route path="/login" element={<Login />} />
        <Route path="/book/:cote" element={<BookDetails />} /> {/* ✅ هذه هي route المهمة */}

        {/* Admin */}
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/books" element={<BooksList />} />
        <Route path="/admin/addbook" element={<AddBook />} />
        <Route path="/admin/besoins" element={<BesoinsList />} />
        <Route path="/admin/prets" element={<PretsList />} />
        <Route path="/admin/reservations" element={<ReservationsList />} />
        <Route path="/admin/secteurs" element={<GestionSecteurs />} />
        <Route path="/editbook/:cote" element={<EditBookWrapper />} />

        {/* Stagiaire */}
        <Route path="/demande-besoin" element={<DemandeBesoin />} />
        <Route path="/mes-reservations" element={<MesReservations />} />
        <Route path="/mes-besoins" element={<MesBesoins />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

function EditBookWrapper() {
  const { cote } = useParams();
  return <EditBook cote={cote} setActivePage={() => {}} />;
}

export default App;
