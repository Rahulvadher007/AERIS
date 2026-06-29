"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { stationService } from '../services/station.service';

interface CityContextType {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  availableCities: string[];
  isLoadingCities: boolean;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export function CityProvider({ children }: { children: ReactNode }) {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(true);

  useEffect(() => {
    async function loadCities() {
      try {
        const cities = await stationService.getCities();
        setAvailableCities(cities);
        
        // Restore from localStorage or default to the first available city
        const savedCity = localStorage.getItem('aeris_selected_city');
        if (savedCity && cities.includes(savedCity)) {
          setSelectedCity(savedCity);
        } else if (cities.length > 0) {
          setSelectedCity(cities[0]);
          localStorage.setItem('aeris_selected_city', cities[0]);
        }
      } catch (error) {
        console.error('Failed to load cities for CityContext', error);
      } finally {
        setIsLoadingCities(false);
      }
    }
    
    loadCities();
  }, []);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    localStorage.setItem('aeris_selected_city', city);
  };

  return (
    <CityContext.Provider value={{ selectedCity, setSelectedCity: handleCityChange, availableCities, isLoadingCities }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const context = useContext(CityContext);
  if (context === undefined) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
}
