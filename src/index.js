import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.js'
//import registerServiceWorker from './registerServiceWorker';
import { unregister } from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
//registerServiceWorker();
unregister();
