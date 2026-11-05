import {QUESTION_BANK, TOPICS} from './quiz-bank.mjs';

/** All quiz operations are local and deterministic for an injected random source. */
export const DIFFICULTIES = Object.freeze(['Beginner','Intermediate','Advanced']);
export const QUESTION_COUNT = 5;
export const emptyQuiz = () => ({phase:'choose',difficulty:null,topic:'',deck:[],index:0,score:0,
  answered:false,selected:null,seenIds:[],feedback:''});

function shuffle(items, random) {
  const result=[...items];
  for(let i=result.length-1;i>0;i--){
    const n=random();
    const j=Math.min(i,Math.max(0,Math.floor((Number.isFinite(n)?n:0.5)*(i+1))));
    [result[i],result[j]]=[result[j],result[i]];
  }
  return result;
}

/** Select distinct questions; prefer ones not seen in the immediately preceding rounds. */
export function createDeck({topic='all',difficulty='Beginner',count=QUESTION_COUNT,excludeIds=[],random=Math.random}={}){
  if(!TOPICS.some(item=>item.id===topic))throw new RangeError('Select a supported technology topic.');
  if(!DIFFICULTIES.includes(difficulty))throw new RangeError('Select Beginner, Intermediate, or Advanced.');
  if(!Number.isInteger(count)||count<1)throw new RangeError('Question count must be a positive integer.');
  const eligible=QUESTION_BANK.filter(item=>item.level===difficulty && (topic==='all'||item.topic===topic));
  if(eligible.length<count)throw new Error('Not enough curated questions are available for this selection.');
  const excluded=new Set(excludeIds);
  const preferred=shuffle(eligible.filter(item=>!excluded.has(item.id)),random);
  const remaining=shuffle(eligible.filter(item=>excluded.has(item.id)),random);
  return [...preferred,...remaining].slice(0,count).map(item=>Object.freeze({
    ...item,options:Object.freeze(shuffle(item.options,random))
  }));
}

export function quizReducer(state,action){
  if(action.type==='STOP')return emptyQuiz();
  if(action.type==='LOAD'){
    if(!DIFFICULTIES.includes(action.difficulty)||!TOPICS.some(t=>t.id===action.topic)||
      !Array.isArray(action.deck)||!action.deck.length||new Set(action.deck.map(x=>x.id)).size!==action.deck.length)
      throw new Error('Invalid quiz question set.');
    return {...emptyQuiz(),phase:'playing',topic:action.topic,difficulty:action.difficulty,deck:action.deck};
  }
  if(state.phase!=='playing')return state;
  const question=state.deck[state.index];
  if(!question)return {...state,phase:'complete'};
  if(action.type==='ANSWER'){
    if(state.answered||!question.options.includes(action.answer))return state;
    const correct=action.answer===question.correct;
    return {...state,answered:true,selected:action.answer,score:state.score+(correct?1:0),
      seenIds:[...state.seenIds,question.id],
      feedback:correct?`Correct! ${question.explanation}`:
        `Not quite. Correct answer: ${question.correct}. ${question.explanation}`};
  }
  if(action.type==='NEXT'&&state.answered){
    if(state.index>=state.deck.length-1)return {...state,phase:'complete'};
    return {...state,index:state.index+1,answered:false,selected:null,feedback:''};
  }
  return state;
}
