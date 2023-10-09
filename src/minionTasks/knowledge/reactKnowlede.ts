export const reactKnowledge = `
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
4. **Functional Components and destructuring props:** Use functional components instead of class components, where possible. 

Example:  
# jsx
// Good: Using functional components and destructuring props
const TodoItem = ({ todo }) => <li>{todo.title}</li>;

These are best practices and principles with examples on how to write correct React components and code. Always comment your code where necessary and keep your code clean, efficient, and don't repeat yourself. These might not fit all projects due to different contexts and conditions, so make sure to adapt as necessary.
`.trim();
