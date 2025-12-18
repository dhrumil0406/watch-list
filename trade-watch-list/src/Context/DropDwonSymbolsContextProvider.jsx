import React, { createContext, useRef, useState } from 'react'

export const DropDownSymbolsContext = createContext();

const DropDwonSymbolsContextProvider = ({ children }) => {
    const [dropDownSymbols, setDropDownSymbols] = useState([]); // All symbols fetched from API for dropdown
    const [filteredSymbols, setFilteredSymbols] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    return (
        <DropDownSymbolsContext.Provider value={{ dropDownSymbols, setDropDownSymbols, filteredSymbols, setFilteredSymbols, isDropdownOpen, setIsDropdownOpen, dropdownRef }}>
            {children}
        </DropDownSymbolsContext.Provider>
    )
}

export default DropDwonSymbolsContextProvider
