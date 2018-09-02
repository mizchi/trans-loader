import React from "react";
import Redux from "redux";
import ReactRedux from "react-redux";

type State = {
  value: number;
};

const reducer = (s: State = { value: 0 }, a: any) => {
  switch (a.type) {
    case "increment": {
      return {
        value: s.value + 1
      };
    }
    default: {
      return s;
    }
  }
};

const store = Redux.createStore(reducer);

const Counter: React.ComponentType<any> = ReactRedux.connect(s => s)(
  (props: State & { dispatch: any }) => {
    return (
      <div>
        <div>
          <p>value: {props.value}</p>
          <button
            onClick={() => {
              props.dispatch({ type: "increment" });
            }}
          >
            increment
          </button>
        </div>
      </div>
    );
  }
);

export default () => (
  <ReactRedux.Provider store={store}>
    <Counter />
  </ReactRedux.Provider>
);
