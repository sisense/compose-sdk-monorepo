import type { Ref } from 'vue';
import { useRefState } from './use-ref-state';

type State = Record<string, unknown>;
type Action = {
  type: string;
};

type Dispatch<A extends Action> = (action: A) => void;
type Reducer<S extends State, A extends Action> = (state: S, action: A) => S;
type ReturnValue<S extends State, A extends Action> = [Ref<S>, Dispatch<A>];

export function useReducer<S extends State, A extends Action>(
  reducer: Reducer<S, A>,
  initialState: S,
) {
  const [state, setState] = useRefState(initialState);
  const dispatch = (action: A) => {
    const newState = reducer(state.value as S, action);
    setState(newState);
  };

  return [state, dispatch] as ReturnValue<S, A>;
}
