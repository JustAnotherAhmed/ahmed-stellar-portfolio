import test from 'node:test';
import assert from 'node:assert/strict';
import {QUESTION_BANK,TOPICS} from './quiz-bank.mjs';
import {DIFFICULTIES,QUESTION_COUNT,createDeck,quizReducer,emptyQuiz} from './quiz.mjs';

test('technical question bank has factual explanations and 4 unique multiple-choice answers',()=>{
  assert.equal(QUESTION_BANK.length,108);
  assert.equal(TOPICS.length,7);
  assert.deepEqual(DIFFICULTIES,['Beginner','Intermediate','Advanced']);
  assert.equal(new Set(QUESTION_BANK.map(q=>q.id)).size,QUESTION_BANK.length);
  for(const q of QUESTION_BANK){
    assert.ok(q.question.length>12,q.id);
    assert.equal(q.options.length,4,q.id);
    assert.equal(new Set(q.options).size,4,q.id);
    assert.ok(q.options.includes(q.correct),q.id);
    assert.ok(q.explanation.length>20,q.id);
  }
});
test('every topic and level offers five nonrepeating questions',()=>{
  for(const topic of TOPICS)for(const difficulty of DIFFICULTIES){
    const deck=createDeck({topic:topic.id,difficulty});
    assert.equal(deck.length,QUESTION_COUNT);
    assert.equal(new Set(deck.map(q=>q.id)).size,QUESTION_COUNT);
    for(const q of deck){
      assert.equal(q.level,difficulty);
      if(topic.id!=='all')assert.equal(q.topic,topic.id);
    }
  }
});
test('question selection prefers previously unseen questions and varies answer positions',()=>{
  const first=createDeck({topic:'python',difficulty:'Intermediate',random:()=>0.35});
  const second=createDeck({topic:'python',difficulty:'Intermediate',excludeIds:first.map(q=>q.id),random:()=>0.83});
  assert.equal(second.filter(q=>!first.some(old=>old.id===q.id)).length,1);
  assert.notDeepEqual(first.map(q=>q.id),second.map(q=>q.id));
  for(const q of second)assert.deepEqual(new Set(q.options).size,4);
});
test('unsupported topics, level, count and insufficient sets fail clearly',()=>{
  assert.throws(()=>createDeck({topic:'anything you type',difficulty:'Beginner'}),/supported/i);
  assert.throws(()=>createDeck({topic:'python',difficulty:'Extreme'}),/Select/i);
  assert.throws(()=>createDeck({topic:'python',difficulty:'Beginner',count:0}),/positive/i);
  assert.throws(()=>createDeck({topic:'python',difficulty:'Beginner',count:40}),/Not enough/i);
});
test('scoring, feedback, no double scoring, next and stop stay intact',()=>{
  const deck=createDeck({topic:'neural',difficulty:'Advanced',random:()=>0.5});
  let state=quizReducer(emptyQuiz(),{type:'LOAD',topic:'neural',difficulty:'Advanced',deck});
  assert.equal(state.phase,'playing');
  assert.equal(quizReducer(state,{type:'NEXT'}).index,0);
  state=quizReducer(state,{type:'ANSWER',answer:deck[0].correct});
  assert.equal(state.score,1);assert.match(state.feedback,/Correct!/);
  assert.equal(quizReducer(state,{type:'ANSWER',answer:deck[0].correct}).score,1);
  while(state.phase==='playing'){
    state=quizReducer(state,{type:'NEXT'});
    if(state.phase==='playing')state=quizReducer(state,{type:'ANSWER',answer:state.deck[state.index].options.find(option=>option!==state.deck[state.index].correct)});
  }
  assert.equal(state.phase,'complete');assert.equal(state.score,1);
  assert.equal(quizReducer(state,{type:'STOP'}).phase,'choose');
});
