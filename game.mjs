/** Pure, deterministic state machine. UI, clock, and storage are separate. */
export const SIGNALS = Object.freeze([
  { question: 'Where are new stars born?', options: ['Comet', 'Nebula', 'Pulsar'], correct: 'Nebula' },
  { question: 'Which object is a rotating neutron star?', options: ['Pulsar', 'Comet', 'Nebula'], correct: 'Pulsar' },
  { question: 'Which icy body can grow a tail near the Sun?', options: ['Nebula', 'Pulsar', 'Comet'], correct: 'Comet' },
]);
export const initialGame = () => ({ phase: 'idle', round: 0, feedback: '', answered: false });
export function updateGame(state, action) {
  if (action.type === 'START' || action.type === 'RESTART') return { phase: 'playing', round: 0, feedback: '', answered: false };
  if (action.type === 'EXIT') return initialGame();
  if (state.phase !== 'playing') return state;
  if (action.type === 'ANSWER') {
    if (state.answered) return state;
    const correct = SIGNALS[state.round]?.correct;
    if (!correct) return initialGame();
    if (action.answer !== correct) return { ...state, feedback: 'Not quite. Try another signal.' };
    if (state.round === SIGNALS.length - 1) return { phase: 'complete', round: state.round, feedback: 'All signals decoded.', answered: true };
    return { ...state, feedback: 'Signal confirmed. Nice work!', answered: true };
  }
  if (action.type === 'NEXT' && state.answered && state.round < SIGNALS.length - 1)
    return { phase: 'playing', round: state.round + 1, feedback: '', answered: false };
  return state;
}
