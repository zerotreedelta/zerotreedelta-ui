import React, { Component } from "react";
import "./App.css";
//import Upload from "./upload/Upload";
import { Route, Switch } from 'react-router-dom'
import HomePage from './pages/HomePage'
import UploadPage from './pages/UploadPage'

//class App extends Component {
//  render() {
//    return (
//      <div className="App">
//        <div className="Card">
//          <Upload />
//        </div>
//      </div>
//    );
//  }
//}

export default function App() {
  return (
    <Switch>
      <Route exact path="/" component={HomePage} />
      <Route path="/garmin-conversion" component={UploadPage} />
    </Switch>
  )
}