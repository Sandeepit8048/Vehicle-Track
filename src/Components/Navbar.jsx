import React from 'react'
import { LuMapPinned } from "react-icons/lu";
function Navbar() {
  return (
    <> 
      <div className="container">
        <nav className="bg-gray-800 p-4">
          <div className="container mx-auto flex justify-between items-center justify-end ">
            <ul className="flex space-x-4 text-white font-semibold text-lg justify-center">
              <li><LuMapPinned /></li>
              <li>Home</li>
            </ul>
          </div>
        </nav>
      </div>
    </>
  )
}

export default Navbar