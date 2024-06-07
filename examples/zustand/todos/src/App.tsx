import { FormEvent } from "react";
import { create } from "zustand";
import { Radio } from "antd";
import { a, useTransition } from "@react-spring/web";
import { CloseOutlined } from "@ant-design/icons";

type FilterType = "all" | "uncompleted" | "completed";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

type Store = {
  todos: Todo[];
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  setTodos: (fn: (todos: Todo[]) => Todo[]) => void;
};

const useStore = create<Store>((set) => ({
  filter: "all",
  todos: [],
  setFilter(filter) {
    set({ filter });
  },
  setTodos(fn) {
    set((prev) => ({ todos: fn(prev.todos) }));
  },
}));

let keyCount = 0;

function Filter() {
  const { filter, setFilter } = useStore();

  return (
    <Radio.Group onChange={(e) => setFilter(e.target.value)} value={filter}>
      <Radio value="all">All</Radio>
      <Radio value="uncompleted">Uncompleted</Radio>
      <Radio value="completed">Completed</Radio>
    </Radio.Group>
  );
}

function TodoItem({ item }: { item: Todo }) {
  const { setTodos } = useStore();
  const { title, completed, id } = item;
  const toggleCompleted = () =>
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !completed } : todo
      )
    );
  const remove = () => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
  };

  return (
    <>
      <input type="checkbox" checked={completed} onChange={toggleCompleted} />
      <span style={{ textDecoration: completed ? "line-through" : "" }}>
        {title}
      </span>
      <CloseOutlined onClick={remove} />
    </>
  );
}

function FilteredTodos() {
  const { todos, filter } = useStore();
  const filteredTodos = todos.filter((todo) => {
    if (filter === "all") return true;
    if (filter === "completed") return todo.completed;
    return !todo.completed;
  });
  const transitions = useTransition(filteredTodos, {
    keys: (todo) => todo.id,
    from: { opacity: 0, height: 0 },
    enter: { opacity: 1, height: 40 },
    leave: { opacity: 0, height: 0 },
  });
  return transitions((style, item) => (
    <a.div className="item" style={style}>
      <TodoItem item={item} />
    </a.div>
  ));
}

export default function App() {
  const { setTodos } = useStore();
  const add = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const title = e.currentTarget.inputTitle.value;
    e.currentTarget.inputTitle.value = "";
    setTodos((prevTodos) => [
      ...prevTodos,
      { title, completed: false, id: keyCount++ },
    ]);
  };

  return (
    <form onSubmit={add}>
      <Filter />
      <input name="inputTitle" placeholder="Type..." />
      <FilteredTodos />
    </form>
  );
}
