import React, { useEffect } from 'react';
import { ASSET_PATHS } from '../config/invariants';

const PreloadImages = () => {
  useEffect(() => {
    // Loop over each image path in ASSET_PATHS and create a new Image object
    Object.values(ASSET_PATHS).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return null;
};

export default PreloadImages;
