import "./index.css";

import React from "react";
import ReactDOM from "react-dom";

import App from "./App";

window.onerror = function (e) {
  console.error(e);
};

window.onload = function () {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById("root")
  );
};
