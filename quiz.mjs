import { QUESTIONS, DIFFICULTIES } from './question-bank.mjs';

export const QUESTIONS_PER_GAME=10;
export const emptyQuiz=()=>({phase:'choose',difficulty:null,deck:[],index:0,answered:false,selected:null,score:0,seenIds:[],feedback:''});
export function shuffle(values, rng=Math.random) {
  const array=[...values];
  for(let i=array.length-1;i>0;i--){
    const raw=Number(rng());
    const j=Math.floor(Math.max(0,Math.min(.999999999,Number.isFinite(raw)?raw:0))* (i+1));
    [array[i],array[j]]=[array[j],array[i]];
  }
  return array;
}
/** Choose a different randomized subset on replay, with no repeats within a game. */
export function createDeck(difficulty,rng=Math.random,previousIds=[]) {
  if(!DIFFICULTIES.includes(difficulty)) throw new RangeError('Unsupported difficulty');
  const pool=shuffle(QUESTIONS[difficulty],rng);
  const count=Math.min(QUESTIONS_PER_GAME,pool.length);
  let selection=pool.slice(0,count);
  // Even with an adversarial/deterministic RNG, a replay uses a different subset.
  if(previousIds.length===count && new Set(selection.map(q=>q.id)).size===new Set([...selection.map(q=>q.id),...previousIds]).size) {
    pool.push(pool.shift());selection=pool.slice(0,count);
  }
  return selection;
}
export function quizReducer(state,action) {
  if(action.type==='STOP')return emptyQuiz();
  if(action.type==='START') {
    const deck=createDeck(action.difficulty,action.rng,action.previousOpening||[]);
    return {...emptyQuiz(),phase:'playing',difficulty:action.difficulty,deck};
  }
  if(state.phase!=='playing')return state;
  const item=state.deck[state.index];
  if(!item)return {...state,phase:'complete'};
  if(action.type==='ANSWER') {
    if(state.answered||!item.options.includes(action.answer))return state;
    const correct=action.answer===item.correct;
    return {...state,answered:true,selected:action.answer,score:state.score+(correct?1:0),seenIds:[...state.seenIds,item.id],feedback:correct?`Correct! ${item.explanation}`:`Not quite. Correct answer: ${item.correct}. ${item.explanation}`};
  }
  if(action.type==='NEXT' && state.answered) {
    if(state.index>=state.deck.length-1)return {...state,phase:'complete'};
    return {...state,index:state.index+1,answered:false,selected:null,feedback:''};
  }
  return state;
}
