export const reactKnowledge = `
Sure, here are examples along with principles for writing correct React components and code:

1. **Single Responsibility Principle:** Each component should ideally be responsible for only one function. 

Example: 
# jsx
// Good: Single responsibility
const FetchDataComponent = ({ url }) => {
  const data = useFetch(url);
  return <DataDisplayComponent data={data} />
}
#

2. **Key in Lists:** Always use the key prop when creating dynamic lists in React. 

Example: 
# jsx
// Good: Adding key prop to each child
const ListComponent = ({items}) => (
  <ul>
    {items.map((item) => <li key={item.id}>{item.name}</li>)}
  </ul>
);
#
3. **Keeping Components Pure:** Avoid directly modifying a component's state. Instead, use setState(). 

Example: 
# jsx
// Good: Updating state via setState
class Counter extends React.Component {
  state = { count: 0 }

  increment = () => {
    this.setState(prevState => ({ count: prevState.count + 1 }));
  };

  render() {
    return <button onClick={this.increment}>{this.state.count}</button>
  }
}
# 
4. **PropTypes Usage:** PropTypes helps catch bugs by checking types passed through props. 

Example: 
# jsx
import PropTypes from 'prop-types';

const DataDisplayComponent = ({ data }) => <div>{data}</div>

DataDisplayComponent.propTypes = {
  data: PropTypes.number.isRequired,
}
# 
5. **Functional Components and destructuring props:** Use functional components instead of class components, where possible. 

Example:  
# jsx
// Good: Using functional components and destructuring props
const TodoItem = ({ todo }) => <li>{todo.title}</li>;
# 
6. **Centralize State Management with Context:** Use React Context or libraries like Redux or MobX to centralize your state. 

Example: 
# jsx
import React, { createContext, useContext } from "react";

// Create a context
const StateContext = createContext();

// Provide context to child components
const StateProvider = ({ children }) => {
  const [state, setState] = useState("example state");

  return (
    <StateContext.Provider value={{ state, setState }}>
      {children}
    </StateContext.Provider>
  );
};

// Consume context within a child component
const ChildComponent = () => {
  const { state, setState } = useContext(StateContext);

  return <div>{state}</div>;
};

<StateProvider>
  <ChildComponent />
</StateProvider>
# 
7. **Using ESLint:** ESLint is a tool that can show you common mistakes, making your codes stricter and easier to understand. 

Example: 

First, you can install ESLint via npm:
# 
npm i eslint --save-dev
# 
Then, create a configuration file named .eslintrc and define rules in the configuration object:
# json
{
    "rules": {
        "no-console": "off",
        "indent": ["error", 2],
        "quotes": ["error", "double"]
    }
}
# 

These are best practices and principles with examples on how to write correct React components and code. Always comment your code where necessary and keep your code clean, efficient, and don't repeat yourself. These might not fit all projects due to different contexts and conditions, so make sure to adapt as necessary.
`.trim();
