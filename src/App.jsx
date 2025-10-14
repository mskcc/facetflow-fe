import { useState } from 'react'
import Login from './components/Login'
import SessionsTable from './components/SessionsTable'
import { Header, Button, Footer } from '@mskcc/components-react'
import { tokenStorage } from './utils/auth'
import './App.scss'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!tokenStorage.getToken())

  const handleLogout = () => {
    tokenStorage.clearTokens()
    setIsLoggedIn(false)
  }

  return (
    <div className={`App ${!isLoggedIn ? 'login-view' : ''}`}>
      <Header
        maxWidth='max'
        productName='FacetsFlow'
        controls={
          isLoggedIn && (
            <Button kind="primary" onClick={handleLogout}>
              Logout
            </Button>
          )
        }
      />
      <main className={`App-main ${!isLoggedIn ? 'login-page' : ''}`}>
        {!isLoggedIn ? (
          <Login onLoginSuccess={() => setIsLoggedIn(true)} />
        ) : (
          <>
            <SessionsTable />
          </>
        )}
      </main>
      <Footer/>
    </div>
  )
}

export default App
