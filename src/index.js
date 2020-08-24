import React from './react';
import ReactDOM from './react-dom';

const ADD = 'ADD'
function reducer (state, action) {
  switch (action.type) {
    case ADD:
      return {count: state.count + 1}
    default:
      return state
  }
}
function Counter() {
  const [state, dispatch] = React.useReducer(reducer, {count: 0}) // 0
  let [number, setNumber] = React.useState(0) // 1
  console.log(number)
  return (
    <div id="counter">
      <div id="counter1">
        <span>{state.count}</span>
        <button onClick={() => dispatch({type: ADD})}>useReducer+</button>
      </div>
      <div id="counter2">
        <span>{number}</span>
        <button onClick={() => setNumber(number+1)}>useState+</button>
      </div>
   
    </div>
  )
}
ReactDOM.render(<Counter name="counter"/>, document.getElementById('root'))