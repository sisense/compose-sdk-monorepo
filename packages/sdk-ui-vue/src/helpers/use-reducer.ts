import { ref, type Ref } from 'vue';

type AnyObject = Record<string, any>;

type State = Record<string, unknown>;
type Action = {
  type: string;
};

type Dispatch<A extends Action> = (action: A) => void;
type Reducer<S extends State, A extends Action> = (state: S, action: A) => S;
type ReturnValue<S extends State, A extends Action> = [Ref<S>, Dispatch<A>];

function updateState(state: State, update: AnyObject): void {
  Object.keys(state).forEach((key) => {
    state[key] = update[key];
  });
}

export function useReducer<S extends State, A extends Action>(
  reducer: Reducer<S, A>,
  initialState: S,
) {
  const state = ref<S>(initialState) as Ref<S>;
  const dispatch = (action: A) => {
    const newState = reducer(state.value as S, action);
    updateState(state.value, newState);
  };

  return [state, dispatch] as ReturnValue<S, A>;
}
