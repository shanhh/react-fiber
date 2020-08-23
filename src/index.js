import React from './react';
import ReactDOM from './react-dom';
let style = {border: '1px solid red', margin: '5px'}
let element = (
  <div id="A1" style={style}>
    A1
    <div id="B1" style={style}>
      B1
      <div id="C1" style={style}>C1</div>
      <div id="C2" style={style}>C2</div>
    </div>
    <div id="B2" style={style}>B2</div>
  </div>
)

/*#__PURE__*/
// React.createElement("div", {
//   id: "A1"
// }, /*#__PURE__*/React.createElement("div", {
//   id: "B2"
// }, /*#__PURE__*/React.createElement("div", {
//   id: "C1"
// }, "C1"), /*#__PURE__*/React.createElement("div", {
//   id: "C2"
// }, "C2")), /*#__PURE__*/React.createElement("div", {
//   id: "B2"
// }, "B2"));
// 虚拟Dom
console.log(element)

ReactDOM.render(
  element,
  document.getElementById('root')
)
