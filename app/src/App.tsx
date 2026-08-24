import { Routes, Route } from 'react-router'
import Layout from './components/Layout'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductPage from './pages/ProductPage'
import Additives from './pages/Additives'
import Scan from './pages/Scan'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/additives" element={<Additives />} />
        <Route path="/scan" element={<Scan />} />
      </Route>
    </Routes>
  )
}
