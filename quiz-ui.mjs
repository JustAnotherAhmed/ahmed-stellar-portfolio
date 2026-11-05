import {TOPICS} from './quiz-bank.mjs';
import {DIFFICULTIES,emptyQuiz,createDeck,quizReducer} from './quiz.mjs';

/** Offline technology quiz: zero API keys, network calls, or paid usage. */
export function initGeneralQuiz(root=document.getElementById('general-quiz')){
  if(!root)return ()=>{};
  const $=selector=>root.querySelector(selector);
  const form=$('#quiz-form'), choose=$('#quiz-choose'), active=$('#quiz-active'), finish=$('#quiz-complete');
  const topicInput=$('#quiz-topic'), levels=$('#quiz-difficulty'), submit=$('#quiz-generate');
  const answers=$('#quiz-options'), question=$('#quiz-question'), feedback=$('#quiz-feedback');
  const next=$('#quiz-next'),progress=$('#quiz-progress'),score=$('#quiz-score'),endScore=$('#quiz-final-score');
  const errorBox=$('#quiz-error'),errorText=$('#quiz-error-text'),retry=$('#quiz-retry'),status=$('#quiz-status');
  const required=[form,choose,active,finish,topicInput,levels,submit,answers,question,feedback,next,progress,score,endScore,errorBox,errorText,retry,status];
  if(required.some(item=>!item))throw new Error('A required quiz control is missing.');
  let state=emptyQuiz(),difficulty='Beginner',disposed=false;
  const history=new Map();
  const topicName=id=>TOPICS.find(t=>t.id===id)?.label||'Technology';
  function setError(message){errorText.textContent=message;errorBox.hidden=false;submit.disabled=false;status.textContent=message;}
  function render(){
    choose.hidden=state.phase!=='choose';active.hidden=state.phase!=='playing';finish.hidden=state.phase!=='complete';
    if(state.phase==='complete'){
      endScore.textContent=`Final score: ${state.score} / ${state.deck.length}. Topic: ${topicName(state.topic)}. Play another round or choose something new.`;
      return;
    }
    if(state.phase!=='playing')return;
    const item=state.deck[state.index];if(!item){setError('Question unavailable. Choose another round.');return;}
    question.textContent=item.question;
    progress.textContent=`${state.difficulty.toUpperCase()} / ${topicName(state.topic).toUpperCase()} · ${state.index+1} OF ${state.deck.length}`;
    score.textContent=`SCORE ${state.score}`;
    feedback.textContent=state.feedback;
    answers.replaceChildren();
    for(const choice of item.options){
      const button=document.createElement('button');button.type='button';button.className='quiz-answer';button.textContent=choice;
      button.disabled=state.answered;
      if(state.answered&&choice===item.correct)button.classList.add('is-correct');
      if(state.answered&&choice===state.selected&&choice!==item.correct)button.classList.add('is-wrong');
      button.setAttribute('aria-pressed',String(state.selected===choice));
      button.addEventListener('click',()=>dispatch({type:'ANSWER',answer:choice}));answers.append(button);
    }
    next.hidden=!state.answered;
    next.textContent=state.index===state.deck.length-1?'Finish this round →':'Next question →';
    if(state.answered)next.focus();
  }
  function dispatch(action){
    try{
      state=quizReducer(state,action);render();
      if(action.type==='NEXT'&&state.phase==='playing')question.focus();
      if(action.type==='STOP'){status.textContent='';topicInput.focus();}
      if(state.phase==='complete')$('#quiz-play-again')?.focus();
    }catch(error){console.error('Quiz error:',error);setError('Questions could not be displayed. Try another round.');}
  }
  function beginRound(){
    if(disposed)return;
    try{
      const topic=topicInput.value;
      const key=`${topic}:${difficulty}`;
      const excludeIds=history.get(key)||[];
      const deck=createDeck({topic,difficulty,excludeIds});
      history.set(key,[...excludeIds,...deck.map(q=>q.id)].slice(-36));
      errorBox.hidden=true;status.textContent='New quiz ready — good luck!';
      state=quizReducer(emptyQuiz(),{type:'LOAD',topic,difficulty,deck});
      render();question.focus();
    }catch(error){console.error('Unable to start offline quiz:',error);setError('Unable to load that topic. Choose a listed topic and try again.');}
  }
  // Populate the topic picker from the curated bank, rather than accepting topics we cannot generate.
  topicInput.replaceChildren();
  for(const item of TOPICS){const option=document.createElement('option');option.value=item.id;option.textContent=item.label;topicInput.append(option);}
  topicInput.value='all';
  for(const level of DIFFICULTIES){
    const button=document.createElement('button');button.type='button';button.className='quiz-difficulty';
    button.setAttribute('aria-pressed',String(level===difficulty));
    const strong=document.createElement('strong');strong.textContent=level;
    const small=document.createElement('small');small.textContent=level==='Beginner'?'Core concepts':level==='Intermediate'?'Applied knowledge':'Expert-level concepts';
    button.append(strong,small);
    button.addEventListener('click',()=>{
      difficulty=level;
      for(const item of levels.children){item.classList.toggle('is-active',item===button);item.setAttribute('aria-pressed',String(item===button));}
    });
    if(level===difficulty)button.classList.add('is-active');levels.append(button);
  }
  form.addEventListener('submit',event=>{event.preventDefault();beginRound();});
  retry.addEventListener('click',beginRound);
  next.addEventListener('click',()=>dispatch({type:'NEXT'}));
  $('#quiz-stop')?.addEventListener('click',()=>dispatch({type:'STOP'}));
  $('#quiz-play-again')?.addEventListener('click',beginRound);
  $('#quiz-change-difficulty')?.addEventListener('click',()=>dispatch({type:'STOP'}));
  render();
  return ()=>{disposed=true;state=emptyQuiz();};
}
