import { useEffect, useState } from 'react';
import api from '../api';

const emptyCatalog = {
  crops: [],
  states: [],
  tamilNaduDistricts: [],
  districts: [],
  markets: [],
};

export default function useAgriCatalog(state = '', district = '', crop = '') {
  const [catalog, setCatalog] = useState(emptyCatalog);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadBaseCatalog = async () => {
      try {
        const [cropResponse, regionResponse] = await Promise.all([
          api.get('/catalog/crops'),
          api.get('/catalog/regions'),
        ]);
        if (!active) return;

        const crops = cropResponse.data.categories
          .flatMap((category) => category.crops.map((item) => item.crop));
        setCatalog((current) => ({
          ...current,
          crops: [...new Map(crops.map((item) => [item.toLocaleLowerCase(), item])).values()],
          states: regionResponse.data.states,
          tamilNaduDistricts: regionResponse.data.tamil_nadu_districts,
        }));
        setError('');
      } catch (requestError) {
        console.error('Failed to load crop and region suggestions', requestError);
        if (active) setError('Crop and state suggestions could not be loaded. You can still type a value.');
      }
    };

    loadBaseCatalog();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const selectedState = state.trim();

    if (!selectedState || !catalog.states.some((option) => option.toLocaleLowerCase() === selectedState.toLocaleLowerCase())) {
      setCatalog((current) => (
        current.districts.length === 0 && current.markets.length === 0
          ? current
          : { ...current, districts: [], markets: [] }
      ));
      return () => {
        active = false;
      };
    }

    const loadLocationOptions = async () => {
      try {
        const selectedCrop = catalog.crops.find(
          (option) => option.toLocaleLowerCase() === crop.trim().toLocaleLowerCase(),
        );
        const response = await api.get('/catalog/locations', {
          params: {
            state: selectedState,
            district: district.trim() || undefined,
            crop: selectedCrop,
          },
        });
        if (!active) return;

        setCatalog((current) => ({
          ...current,
          districts: selectedState.toLocaleLowerCase() === 'tamil nadu'
            ? current.tamilNaduDistricts
            : response.data.districts,
          markets: response.data.markets,
        }));
        setError('');
      } catch (requestError) {
        console.error('Failed to load location and market suggestions', requestError);
        if (active) setError('Location suggestions could not be loaded. You can still type a value.');
      }
    };

    loadLocationOptions();
    return () => {
      active = false;
    };
  }, [state, district, crop, catalog.states]);

  return { ...catalog, error };
}
