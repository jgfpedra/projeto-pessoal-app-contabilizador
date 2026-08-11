import { useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import CalendarScreen from './screens/CalendarScreen';
import StatsScreen from './screens/StatsScreen';
import AddTaskScreen from './screens/AddTaskScreen';
import BottomNav from './components/BottomNav';

export type Screen =
  | { name: 'home' }
  | { name: 'stats' }
  | { name: 'calendar'; taskId: string; taskName: string; taskColor: string }
  | { name: 'addTask'; task?: { id: string; name: string; emoji: string; color: string } };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [tab, setTab] = useState<'home' | 'stats'>('home');

  const navigate = (s: Screen) => setScreen(s);
  const goBack = () => {
    setScreen({ name: tab } as Screen);
  };

  const switchTab = (t: 'home' | 'stats') => {
    setTab(t);
    setScreen({ name: t } as Screen);
  };

  const showNav = screen.name === 'home' || screen.name === 'stats';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {screen.name === 'home' && <HomeScreen navigate={navigate} />}
        {screen.name === 'stats' && <StatsScreen />}
        {screen.name === 'calendar' && (
          <CalendarScreen
            taskId={screen.taskId}
            taskName={screen.taskName}
            taskColor={screen.taskColor}
            onBack={goBack}
          />
        )}
        {screen.name === 'addTask' && (
          <AddTaskScreen task={screen.task} onBack={goBack} />
        )}
      </div>
      {showNav && <BottomNav active={tab} onSwitch={switchTab} navigate={navigate} />}
    </div>
  );
}
