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
import CreateEvent from './Pages/CreateEvent';
import ViewUserProfile from './Pages/ViewUserProfile';
import FindUsersPage from './Pages/FindUserPage';

// Добавьте импорт для страницы 404, если она есть
// import NotFoundPage from './Pages/NotFoundPage';

function App() {
  return (
    <div className="App">
      {/* BrowserRouter должен быть один */}
      {/* basename="/olimpiada" означает, что все пути будут относительно /olimpiada */}
      {/* т.е. /login будет доступен по адресу http://yourdomain.com/olimpiada/login */}
      
      <BrowserRouter basename="/olimpiada">

        {/* Используйте ОДИН компонент Routes */}
        <Routes>
          {/* Главная страница */}
          <Route path='/' element={<Guestt />} />

          {/* Страница входа */}
          <Route path='/Login' element={<Login />} />

          {/* Страницы регистрации */}
          <Route path='/UserReg' element={<UserReg />} />
          <Route path='/OrgReg' element={<OrgReg />} />

          {/* Страницы пользователей */}
          <Route path='/UserPage' element={<UserPage />} /> {/* Рассмотрите '/UserPage/:userId' позже */}
          <Route path='/Profile' element={<Profile />} />   {/* Рассмотрите '/Profile/:userId' позже */}

          {/* Страницы организатора */}
          <Route path='/Org' element={<Org />} />
          <Route path='/ProfileOrg' element={<ProfileOrg />} />
          <Route path='/CreateEvent' element={<CreateEvent />} />

          {/* Страницы модератора */}
          <Route path='/Moder' element={<Moder />} />
          <Route path='/ModerProfile' element={<ProfileModer />} />
          <Route path='/moderaitProfile' element={<ModaraitedProfile />} /> {/* Возможно, опечатка в moderait? */}

          <Route path='/Profile' element={<Profile />} />
          <Route path="/users/:userId" element={<ViewUserProfile />} />
          <Route path="/find-users" element={<FindUsersPage />} /> {/* <--- НОВЫЙ РОУТ */}
          {/* Маршрут для ненайденных страниц (404) - хороший тон */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}

        </Routes>

      </BrowserRouter>
      
    </div>
  );
}

export default App;