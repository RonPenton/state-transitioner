import { createTransitioner } from '../src';

describe('transitioner:', () => {

    test('stateless allows transitions', async () => {
        const STATES = ["NEW", "RUNNING", "ERROR", "DONE"] as const;
        const ACTIONS = ["BEGAN EXECUTING", "HAD ERROR", "FINISHED"] as const;


        const transitioner = createTransitioner({
            states: STATES,
            actions: ACTIONS,
            transitions: [
                { from: 'NEW', action: 'BEGAN EXECUTING', to: 'RUNNING' },
                { from: 'NEW', action: 'HAD ERROR', to: 'ERROR' },
                { from: 'RUNNING', action: 'HAD ERROR', to: 'ERROR' },
                { from: 'RUNNING', action: 'FINISHED', to: 'DONE' }
            ],
            endStates: ['ERROR', 'DONE']
        });

        let state = transitioner.transition("NEW", "HAD ERROR");
        expect(state).toBe("ERROR");

        state = transitioner.transition("NEW", "BEGAN EXECUTING");
        expect(state).toBe("RUNNING");

        state = transitioner.transition("NEW", "FINISHED");
        expect(state).toBe(null);

        state = transitioner.transition("RUNNING", "BEGAN EXECUTING");
        expect(state).toBe(null);

        expect(transitioner.isDone("ERROR")).toBe(true);
        expect(transitioner.isDone("DONE")).toBe(true);
        expect(transitioner.isDone("NEW")).toBe(false);
        expect(transitioner.isDone("RUNNING")).toBe(false);
    });

    test('stateful throws on invalid start state', async () => {
        const STATES = ["NEW", "RUNNING", "ERROR", "DONE"] as const;
        const ACTIONS = ["BEGAN EXECUTING", "HAD ERROR", "FINISHED"] as const;

        const transitioner = createTransitioner({
            states: STATES,
            actions: ACTIONS,
            transitions: [
                { from: 'NEW', action: 'BEGAN EXECUTING', to: 'RUNNING' },
                { from: 'NEW', action: 'HAD ERROR', to: 'ERROR' },
                { from: 'RUNNING', action: 'HAD ERROR', to: 'ERROR' },
                { from: 'RUNNING', action: 'FINISHED', to: 'DONE' }
            ],
            endStates: ['ERROR', 'DONE']
        });

        const create = () => {
            transitioner.createMachine();
        }

        expect(create).toThrow();
    });

    test('stateful allows changing start state', async () => {
        const STATES = ["NEW", "RUNNING", "ERROR", "DONE"] as const;
        const ACTIONS = ["BEGAN EXECUTING", "HAD ERROR", "FINISHED"] as const;

        const transitioner = createTransitioner({
            states: STATES,
            actions: ACTIONS,
            transitions: [
                { from: 'NEW', action: 'BEGAN EXECUTING', to: 'RUNNING' },
                { from: 'NEW', action: 'HAD ERROR', to: 'ERROR' },
                { from: 'RUNNING', action: 'HAD ERROR', to: 'ERROR' },
                { from: 'RUNNING', action: 'FINISHED', to: 'DONE' }
            ],
            endStates: ['ERROR', 'DONE']
        });

        const machine = transitioner.createMachine({ start: "RUNNING" });

        expect(machine.state()).toBe("RUNNING");
    });


    test('stateful allows transitions', async () => {
        const STATES = ["NEW", "RUNNING", "ERROR", "DONE"] as const;
        const ACTIONS = ["BEGAN EXECUTING", "HAD ERROR", "FINISHED"] as const;

        const transitioner = createTransitioner({
            states: STATES,
            actions: ACTIONS,
            transitions: [
                { from: 'NEW', action: 'BEGAN EXECUTING', to: 'RUNNING' },
                { from: 'NEW', action: 'HAD ERROR', to: 'ERROR' },
                { from: 'RUNNING', action: 'HAD ERROR', to: 'ERROR' },
                { from: 'RUNNING', action: 'FINISHED', to: 'DONE' }
            ],
            start: "NEW",
            endStates: ['ERROR', 'DONE']
        });

        const machine = transitioner.createMachine();

        expect(machine.state()).toBe("NEW");
        expect(machine.isDone()).toBe(false);

        expect(machine.canTransition("FINISHED")).toBe(false);
        expect(machine.canTransition("HAD ERROR")).toBe(true);

        machine.transition("HAD ERROR");

        expect(machine.state()).toBe("ERROR");
        expect(machine.isDone()).toBe(true);
    });

    test('stateful throws', async () => {
        const STATES = ["NEW", "RUNNING", "ERROR", "DONE"] as const;
        const ACTIONS = ["BEGAN EXECUTING", "HAD ERROR", "FINISHED"] as const;

        const transitioner = createTransitioner({
            states: STATES,
            actions: ACTIONS,
            transitions: [
                { from: 'NEW', action: 'BEGAN EXECUTING', to: 'RUNNING' },
                { from: 'NEW', action: 'HAD ERROR', to: 'ERROR' },
                { from: 'RUNNING', action: 'HAD ERROR', to: 'ERROR' },
                { from: 'RUNNING', action: 'FINISHED', to: 'DONE' }
            ],
            start: "NEW",
            endStates: ['ERROR', 'DONE']
        });

        const machine = transitioner.createMachine();

        const go = () => machine.transition("FINISHED");
        expect(go).toThrow();
    });

    test('no end states', async () => {
        const STATES = ["NEW", "RUNNING", "ERROR", "DONE"] as const;
        const ACTIONS = ["BEGAN EXECUTING", "HAD ERROR", "FINISHED"] as const;

        const transitioner = createTransitioner({
            states: STATES,
            actions: ACTIONS,
            transitions: [
                { from: 'NEW', action: 'BEGAN EXECUTING', to: 'RUNNING' },
                { from: 'NEW', action: 'HAD ERROR', to: 'ERROR' },
                { from: 'RUNNING', action: 'HAD ERROR', to: 'ERROR' },
                { from: 'RUNNING', action: 'FINISHED', to: 'DONE' }
            ]
        });

        expect(transitioner.isDone("NEW")).toBe(false);
        expect(transitioner.isDone("RUNNING")).toBe(false);
        expect(transitioner.isDone("ERROR")).toBe(false);
        expect(transitioner.isDone("DONE")).toBe(false);
    });

    test('stateful logs', async () => {
        const STATES = ["NEW", "RUNNING", "ERROR", "DONE"] as const;
        const ACTIONS = ["BEGAN EXECUTING", "HAD ERROR", "FINISHED"] as const;

        const transitioner = createTransitioner({
            states: STATES,
            actions: ACTIONS,
            transitions: [
                { from: 'NEW', action: 'BEGAN EXECUTING', to: 'RUNNING' },
                { from: 'NEW', action: 'HAD ERROR', to: 'ERROR' },
                { from: 'RUNNING', action: 'HAD ERROR', to: 'ERROR' },
                { from: 'RUNNING', action: 'FINISHED', to: 'DONE' }
            ],
            start: "NEW",
            endStates: ['ERROR', 'DONE']
        });

        let log: string[] = [];
        const machine = transitioner.createMachine({
            identifier: '12345',
            logger: (msg) => log.push(msg)
        });

        machine.transition("BEGAN EXECUTING");
        machine.transition("FINISHED");

        expect(log[0]).toBe('Transitioned {12345} from {NEW} with action {BEGAN EXECUTING} to {RUNNING}.');
        expect(log[1]).toBe('Transitioned {12345} from {RUNNING} with action {FINISHED} to {DONE}.');
    });

});
