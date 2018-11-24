import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import Game from './Game.js'
import AssLoader from './AssLoader.js'

ReactDOM.render(
  <BrowserRouter>
    <Switch>

      <Route path="(.*)?/assloader">
        <AssLoader/>
      </Route>

      <Route>
        <Game/>
      </Route>

    </Switch>
  </BrowserRouter>,
  document.getElementById('root')
);
