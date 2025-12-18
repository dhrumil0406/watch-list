import React from 'react'
import DataContextProvider from "./DataContextProvider";
import DropDwonSymbolsContextProvider from './DropDwonSymbolsContextProvider';
import SymbolsContextProvider from './SymbolsContextProvider';
import AuthContextProvider from './AuthContextProvider';

const AppProvider = ({ children }) => {
    return (
        <AuthContextProvider>
            <DataContextProvider>
                <DropDwonSymbolsContextProvider>
                    <SymbolsContextProvider>
                        {children}
                    </SymbolsContextProvider>
                </DropDwonSymbolsContextProvider>
            </DataContextProvider>
        </AuthContextProvider>
    )
}

export default AppProvider
