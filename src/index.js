import React from 'react';
import ReactDOM from 'react-dom';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import Game from './Game.js'
import AssLoader from './AssLoader.js'
import { basename } from '../package.json';
import { unregister } from './registerServiceWorker';

const llssTheme = getMuiTheme({
  "palette": {
    "primary1Color": "#64b5f6",
    "textColor": "rgba(0, 34, 68, 1.00)",
  }
});

ReactDOM.render(
  <BrowserRouter basename={basename}>
    <Switch>

      <Route path="(.*)?/assloader">
        <MuiThemeProvider muiTheme={llssTheme}>
          <AssLoader/>
        </MuiThemeProvider>
      </Route>

      <Route>
        <MuiThemeProvider muiTheme={llssTheme}>
          <Game/>
        </MuiThemeProvider>
      </Route>

    </Switch>
  </BrowserRouter>,
  document.getElementById('root')
);

unregister();
