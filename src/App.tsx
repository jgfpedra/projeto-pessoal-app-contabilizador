import { useState } from 'react';
import HomeScreen from './screens/home/HomeScreen';
import CalendarScreen from './screens/calendar/CalendarScreen';
import AddEventScreen from './screens/addEvent/AddEventScreen';
import BottomNav from './components/BottomNav';
import { CalendarEvent } from './types';

export type Screen =
  | { name: 'home' }
  | { name: 'calendar' }
  | { name: 'addEvent'; event?: CalendarEvent };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [tab, setTab] = useState<'home' | 'calendar'>('home');

  const navigate = (s: Screen) => setScreen(s);
  const goBack = () => setScreen({ name: tab } as Screen);

  const switchTab = (t: 'home' | 'calendar') => {
    setTab(t);
    setScreen(t === 'calendar' ? { name: 'calendar' } : { name: 'home' });
  };

  const showNav = screen.name === 'home' || screen.name === 'calendar';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {screen.name === 'home' && <HomeScreen navigate={navigate} />}
        {screen.name === 'calendar' && <CalendarScreen navigate={navigate} />}
        {screen.name === 'addEvent' && <AddEventScreen event={screen.event} onBack={goBack} />}
      </div>
      {showNav && <BottomNav active={tab} onSwitch={switchTab} navigate={navigate} />}
    </div>
  );
}
