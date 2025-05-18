import React, { createContext, useContext, ReactNode } from 'react';
import { isLightweightMode, lightweightFeatures } from '@/lib/lightweight';

type LightweightContextType = {
  isLightweight: boolean;
  features: typeof lightweightFeatures;
};

const LightweightContext = createContext<LightweightContextType>({
  isLightweight: false,
  features: lightweightFeatures,
});

export const useLightweight = () => useContext(LightweightContext);

interface LightweightProviderProps {
  children: ReactNode;
}

export const LightweightProvider: React.FC<LightweightProviderProps> = ({ children }) => {
  const isLightweight = isLightweightMode();
  
  return (
    <LightweightContext.Provider value={{ isLightweight, features: lightweightFeatures }}>
      {children}
    </LightweightContext.Provider>
  );
};
