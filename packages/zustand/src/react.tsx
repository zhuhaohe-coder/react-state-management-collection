import { useSyncExternalStoreWithSelector } from "use-sync-external-store/with-selector";

type GetState<T> = () => T;

type SetState<T> = (
  partial: T | Partial<T> | ((state: T) => T | Partial<T>)
) => void;

type Subscribe = Parameters<typeof useSyncExternalStoreWithSelector>[0];

type EqualityFn<T> = (a: T, b: T) => boolean;

type StoreApi<T> = {
  setState: SetState<T>;
  getState: GetState<T>;
  subscribe: Subscribe;
};

type StateCreator<T> = (setState: SetState<T>) => T;

function createStore<T>(createState: StateCreator<T>): StoreApi<T> {
  const listeners = new Set<() => void>();
  let state: T; // store内部状态存储于state上
  const setState: SetState<T> = (partial) => {
    const nextState =
      typeof partial === "function"
        ? (partial as (state: T) => T)(state)
        : partial;
    if (!Object.is(nextState, state)) {
      state =
        typeof nextState !== "object" || nextState === null
          ? nextState
          : Object.assign({}, state, nextState);
      listeners.forEach((listener) => {
        listener();
      });
    }
  }; // setState就是create接收函数的入参
  const getState = () => state;
  const subscribe: Subscribe = (subscribe) => {
    listeners.add(subscribe);
    return () => {
      listeners.delete(subscribe);
    };
  }; // 每次订阅时将subscribe加入到listeners，subscribe的作用是触发组件重新渲染
  state = createState(setState); //state的初始值就是createState的调用结果
  const api = { setState, getState, subscribe };
  return api;
}

const useStore = <State, StateSlice>(
  api: StoreApi<State>,
  selector: (state: State) => StateSlice = api.getState as any,
  equalityFn?: EqualityFn<StateSlice>
) => {
  const slice = useSyncExternalStoreWithSelector(
    api.subscribe,
    api.getState,
    api.getState,
    selector,
    equalityFn
  );
  return slice;
};

export function create<T>(createState: StateCreator<T>) {
  const api = createStore(createState); //拿到store，包含了全部操作store的方法
  function useBoundStore<TSlice = T>(
    selector?: (state: T) => TSlice,
    equalityFn?: EqualityFn<TSlice>
  ) {
    return useStore(api, selector, equalityFn);
  }
  Object.assign(useBoundStore, api);
  return useBoundStore as typeof useBoundStore & StoreApi<T>;
}
