import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Guestt from './Pages/Guestt';
import Login from './Pages/Login';
import UserReg from './Pages/UserReg';
import OrgReg from './Pages/OrgReg';
import UserPage from './Pages/UserPage';
function App() {
  return (
    <div className="App">
      <BrowserRouter basename="/olimpiada">
    <Routes>
      <Route path='/' element={<Guestt/>}/>
    </Routes>
    <Routes>
      <Route path='/login' element={<Login/>}/>
    </Routes>
    <Routes>
      <Route path='/UserReg' element={<UserReg/>}/>
    </Routes>
    <Routes>
      <Route path='/OrgReg' element={<OrgReg/>}/>
    </Routes>
    <Routes>
      <Route path='/UserPage' element={<UserPage/>}/>{/* '/UserPage/:userId' */}
    </Routes>
    <Routes>
      <Route path='/Profile/' element={<UserPage/>}/>{/* '/Profile/:userId' */}
    </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
