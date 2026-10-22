import './App.css'
import { Button } from './components/ui/Button';
import { PlusIcon } from './icons/plusIcons';
import { ShareIcon } from './icons/shareIcons';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 gap-4">
      <Button startIcon={<ShareIcon />} variant="secondary" text="Share" />
      <Button startIcon={<PlusIcon />} variant="primary" text="Add Content" />
    </div>
  );
}

export default App;
