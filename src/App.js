import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Guestt from './Pages/Guestt';
import Login from './Pages/Login';
import UserReg from './Pages/UserReg';
import OrgReg from './Pages/OrgReg';
import UserPage from './Pages/UserPage';
import Profile from './Pages/Profile';
import Org from './Pages/Org';
import ProfileOrg from './Pages/ProfileOrg';
import ProfileModer from './Pages/ProfileModer';
import Moder from './Pages/Moder';
import ModaraitedProfile from './Pages/ModaraitedProfile';
import Applications from './Pages/Applications';
function App() {
  return (
    <div className="App">
      <BrowserRouter basename="/olimpiada">
   <Routes>
      <Route path='/' element={<Guestt/>}/>
   
    
      <Route path='/login' element={<Login/>}/>
    
   
      <Route path='/UserReg' element={<UserReg/>}/>
    
    
      <Route path='/OrgReg' element={<OrgReg/>}/>
    
    
      <Route path='/UserPage' element={<UserPage/>}/>{/* '/UserPage/:userId' */}
    
    
      <Route path='/Profile/' element={<Profile/>}/>{/* '/Profile/:userId' */}
   
   
      <Route path='/OrgPage/' element={<Org/>}/>{/* '/Profile/:userId' */}
    
   
      <Route path='/ProfileOrg/' element={<ProfileOrg/>}/>{/* '/Profile/:userId' */}
    
   
      <Route path='/ModerProfile/' element={<ProfileModer/>}/>{/* '/Profile/:userId' */}
    
    
      <Route path='/Moder/' element={<Moder/>}/>{/* '/Profile/:userId' */}
    
   
      <Route path='/moderaitProfile/' element={<ModaraitedProfile/>}/>{/* '/Profile/:userId' */}
      <Route path='/applications/' element={<Applications/>}/>{/* '/Profile/:userId' */}
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
