import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch,
  useParams
} from "react-router-dom";
import ProjectList from "./components/ProjectList/ProjectList";
import Index from "./components/Index/Index";
import Nous from "./components/Nous/Nous";
import "./App.scss";

var span = document.getElementById('clock');

	      function time() {
	        let d = new Date();
	        let s = d.getSeconds();
	        let m = d.getMinutes();
	        let h = d.getHours();
	        span.textContent = h + ":" + m + ":" + s;
	      }

	      setInterval(time, 1000);

export default function App() {
	return (
    <Router>
      <div>
        <ul>
          <li>
            <Link to="/index" className="index">Index</Link>
          </li>
          <li>
            <Link to="/nous" className="nous">Nous</Link>
          </li>
          <li>
            <Link to="/" className="nosVoyages">Nos Voyages</Link>
          </li>
          <li>
            <Link to="https://www.google.com/maps/place/Paris/" className="notrePosition">48.8566, 2.3522</Link>
          </li>
        </ul>

        <Switch>
          <Route path="/index">
            <Index className="App"/>
          </Route>
          <Route path="/nous">
            <Nous className="App"/>
          </Route>
          <Route path="/">
			<ProjectList className="App"/>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}
