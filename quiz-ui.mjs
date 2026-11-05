import { DIFFICULTIES } from './question-bank.mjs';
import { emptyQuiz, quizReducer } from './quiz.mjs';

export function initGeneralQuiz(root=document.getElementById('general-quiz')) {
  if (!root) return () => {};
  const $=selector=>root.querySelector(selector);
  const choose=$('#quiz-choose'),active=$('#quiz-active'),finish=$('#quiz-complete');
  const choices=$('#quiz-difficulty'),answers=$('#quiz-options'),question=$('#quiz-question'),feedback=$('#quiz-feedback');
  const next=$('#quiz-next'),progress=$('#quiz-progress'),score=$('#quiz-score'),endScore=$('#quiz-final-score');
  const stop=$('#quiz-stop');
  let state=emptyQuiz(); let lastOpening=[]; let lastDifficulty=null;
  function render(){
    choose.hidden=state.phase!=='choose';
    active.hidden=state.phase!=='playing';
    finish.hidden=state.phase!=='complete';
    if(state.phase==='complete') {endScore.textContent=`Final score: ${state.score} / ${state.deck.length}. You explored every ${state.difficulty.toLowerCase()} question!`;return;}
    if(state.phase!=='playing')return;
    const item=state.deck[state.index];
    question.textContent=item.question;
    progress.textContent=`${state.difficulty.toUpperCase()} / ${item.topic.toUpperCase()} · ${state.index+1} OF ${state.deck.length}`;
    score.textContent=`SCORE ${state.score}`;
    feedback.textContent=state.feedback;
    answers.replaceChildren();
    for(const choice of item.options){
      const btn=document.createElement('button');btn.type='button';btn.className='quiz-answer';btn.textContent=choice;
      btn.disabled=state.answered;
      if(state.answered && choice===item.correct)btn.classList.add('is-correct');
      if(state.answered && choice===state.selected && choice!==item.correct)btn.classList.add('is-wrong');
      btn.setAttribute('aria-pressed',String(state.selected===choice));
      btn.addEventListener('click',()=>dispatch({type:'ANSWER',answer:choice}));
      answers.append(btn);
    }
    next.hidden=!state.answered;
    next.textContent=state.index===state.deck.length-1?'Finish this run →':'Next question →';
    if(state.answered)next.focus();
  }
  function dispatch(action) {
    try {
      if(action.type==='START'){
        const previously=action.difficulty===lastDifficulty?lastOpening:[];
        state=quizReducer(state,{...action,previousOpening:previously});
        lastOpening=state.deck.map(q=>q.id);lastDifficulty=action.difficulty;
      } else state=quizReducer(state,action);
      render();
      if(action.type==='START'||action.type==='NEXT'&&state.phase==='playing')question.focus();
      if(action.type==='STOP')choices.querySelector('button')?.focus();
      if(state.phase==='complete')$('#quiz-play-again')?.focus();
    }catch(error){console.error('Quiz error',error);state=emptyQuiz();render();const note=$('#quiz-status');note.textContent='The quiz is temporarily unavailable. Your portfolio is still accessible.';}
  }
  for (const level of DIFFICULTIES){
    const button=document.createElement('button');button.type='button';button.className='quiz-difficulty';
    button.innerHTML=`<strong>${level}</strong><small>${level==='Easy'?'Everyday essentials':level==='Medium'?'A curious challenge':'Deep-cut knowledge'}</small>`;
    button.addEventListener('click',()=>dispatch({type:'START',difficulty:level}));
    choices.append(button);
  }
  next.addEventListener('click',()=>dispatch({type:'NEXT'}));
  stop.addEventListener('click',()=>dispatch({type:'STOP'}));
  $('#quiz-play-again').addEventListener('click',()=>dispatch({type:'START',difficulty:state.difficulty}));
  $('#quiz-change-difficulty').addEventListener('click',()=>dispatch({type:'STOP'}));
  render();
  return ()=>{state=emptyQuiz();};
}
