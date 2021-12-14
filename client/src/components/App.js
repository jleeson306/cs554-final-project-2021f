import logo from '../logo.svg';
import '../App.css';
import Login from './login';
import Portfolio from './Portfolio';
<<<<<<< HEAD
import Betting from './Betting';
// const call = require('wasm-imagemagick');
=======
import Ranking from './Ranking';
>>>>>>> 3adcb4620b1d8057ac401fa27f5bede9a4e9a1ce
import '../css/styles.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloProvider
} from '@apollo/client';
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: 'http://localhost:4000'
  })
})


function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
      <div className="App">
        <header>
        </header>
        <div>
          <Routes>
            <Route exact path="/login" element={<Login/>}/>
            <Route exact path ="/portfolio" element={<Portfolio/>}/>
            <Route exact path = "betting" element={<Betting/>}/>
            <Route exact path="/rankings" element={<Ranking/>}/>
          </Routes>
        </div>
      </div>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;
