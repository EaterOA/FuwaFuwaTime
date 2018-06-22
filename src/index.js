import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.js'
import AssLoader from './AssLoader.js'
import { basename } from '../package.json';
import { unregister } from './registerServiceWorker';
import { BrowserRouter, Route, Switch } from 'react-router-dom'

ReactDOM.render(
  <BrowserRouter basename={basename}>
    <Switch>
      <Route path="(.*)?/assloader" component={AssLoader}/>
      <Route>
        <App />
      </Route>
    </Switch>
  </BrowserRouter>,
  document.getElementById('root')
);

unregister();
