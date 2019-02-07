import React                           from "react";
import ReactDOM                        from 'react-dom';
import { HashRouter as Router, Route } from "react-router-dom";
import Todo                            from './pages/Todo';
import Home                            from './pages/index';
import registerServiceWorker           from './registerServiceWorker';

import './styles/App.css';

const App = () => (
  <Router>
    <div>
      <Route exact path="/" component={Home} />
      <Route path="/todo" component={Todo} />
    </div>
  </Router>
);

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
