import "./App.css";
import Dashboard from "./components/Dashboard";

const App: React.FC = () => {
  return (
    <div className="App h-screen overflow-hidden">
      <h2 className="text-center text-xl font-bold mb-4">
        Restaurants Management App
      </h2>
      <Dashboard />
    </div>
  );
};

export default App;
