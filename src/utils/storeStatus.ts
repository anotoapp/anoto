import type { OpeningHours } from '../types';

interface StoreConfig {
  is_open_manual?: boolean;
  opening_hours?: OpeningHours;
}

export function isStoreOpen(config: StoreConfig): { isOpen: boolean; message?: string } {
  // 1. Check manual status
  if (config.is_open_manual === false) {
    return { isOpen: false, message: 'Fechado manualmente pelo lojista' };
  }

  // 2. Check business hours
  if (!config.opening_hours) return { isOpen: true };

  const now = new Date();
  // Adjust for local time if necessary, but Date() usually works for local browser time
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  const today = days[now.getDay()];
  const hoursConfig = config.opening_hours[today];

  if (!hoursConfig || !hoursConfig.isOpen) {
    return { isOpen: false, message: 'Fechado hoje' };
  }

  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = hoursConfig.open.split(':').map(Number);
  const [closeH, closeM] = hoursConfig.close.split(':').map(Number);
  
  const openTime = openH * 60 + openM;
  let closeTime = closeH * 60 + closeM;

  // Handle hours crossing midnight (e.g., 18:00 to 02:00)
  if (closeTime <= openTime) {
    closeTime += 24 * 60;
  }

  // If current time is early morning and it belongs to the previous day's shift
  // (e.g., it's 01:00 and yesterday closed at 02:00)
  const yesterday = days[(now.getDay() + 6) % 7];
  const yesterdayConfig = config.opening_hours[yesterday];
  if (yesterdayConfig && yesterdayConfig.isOpen) {
    const [yOpenH, yOpenM] = yesterdayConfig.open.split(':').map(Number);
    const [yCloseH, yCloseM] = yesterdayConfig.close.split(':').map(Number);
    const yOpenTime = yOpenH * 60 + yOpenM;
    const yCloseTime = yCloseH * 60 + yCloseM;
    
    if (yCloseTime <= yOpenTime) {
      const currentTimePlus24 = currentTime + 24 * 60;
      const yCloseTimePlus24 = yCloseTime + 24 * 60;
      if (currentTimePlus24 < yCloseTimePlus24) return { isOpen: true };
    }
  }

  if (currentTime >= openTime && currentTime < closeTime) {
    return { isOpen: true };
  }

  return { isOpen: false, message: `Abriremos às ${hoursConfig.open}` };
}
