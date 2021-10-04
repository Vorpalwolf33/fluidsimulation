import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import "./App.scss";
import Application from './app/homePage';
import Graphics from './app/graphicsTest';

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/" component={Graphics} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
