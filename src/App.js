import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import "./App.scss";
import Application from './app/homePage';

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/" component={Application} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
