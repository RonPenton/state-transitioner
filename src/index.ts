
type SA = readonly string[];

export interface Transition<S extends SA, A extends SA> {
    readonly from: S[number];
    readonly action: A[number];
    readonly to: S[number];
}

export interface TransitionerOptions<S extends SA, A extends SA> {
    states: S,
    actions: A,
    readonly transitions: Transition<S, A>[];
    start?: S[number],
    endStates?: S[number][];
}

export interface MachineOptions<S extends SA> {
    start?: S[number]
    identifier?: string;
    logger?: (message: string) => void;
}

export const createTransitioner = <S extends SA, A extends SA>(options: TransitionerOptions<S, A>) => {

    const { states, actions, transitions, start, endStates } = options;
    type State = S[number];
    type Action = A[number];

    const _transition = (state: State, action: Action) => {
        const transition = transitions.filter(x => x.from == state && x.action == action);
        if (transition.length != 1) {
            return null;
        }
        return transition[0].to;
    };

    const isDone = (state: State) => {
        return endStates?.includes(state) ?? false;
    }

    const createMachine = (machineOptions?: MachineOptions<S>) => {

        const initial = machineOptions?.start ?? start;
        if (!initial)
            throw new Error('Cannot create state machine, no start state defined.');

        const { identifier, logger } = machineOptions ?? {};
        let state = initial;

        const log = (message: string) => {
            if (logger)
                logger(message);
        }

        const transition = (action: Action) => {
            const newState = _transition(state, action);
            if (!newState) {
                const msg = `Cannot transition {${identifier}} from {${state}} with action {${action}}.`;
                log(msg);
                throw new Error(msg);
            }
            log(`Transitioned {${identifier}} from {${state}} with action {${action}} to {${newState}}.`);
            state = newState;
            return state;
        }

        const canTransition = (action: Action) => {
            return _transition(state, action) !== null;
        }

        return {
            transition,
            canTransition,
            states,
            actions,
            identifier,
            state: () => state,
            isDone: () => isDone(state)
        }
    }

    return {
        states,
        actions,
        transition: _transition,
        isDone,
        createMachine
    };
}
