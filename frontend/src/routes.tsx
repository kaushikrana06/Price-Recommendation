import { Route, Routes } from 'react-router-dom'
import Dashboard from './screens/Dashboard'
import ListingDetail from './screens/ListingDetail'
import Compare from './screens/Compare'
import Doc from './screens/Doc'

export default function RoutesView(){
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/listing/:id" element={<ListingDetail />} />
      <Route path="/compare" element={<Compare />} />
      <Route path="/doc" element={<Doc />} />
    </Routes>
  )
}
