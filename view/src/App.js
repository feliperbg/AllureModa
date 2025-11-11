
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from './components/Login';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/products/:slug" component={ProductDetail} />
        <Route path="/products" component={ProductList} />
      </Switch>
    </Router>
  );
}

export default App;
