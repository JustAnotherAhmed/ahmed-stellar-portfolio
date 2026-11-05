import test from 'node:test';
import assert from 'node:assert/strict';
import {QUESTION_BANK, QUESTIONS,DIFFICULTIES} from './question-bank.mjs';
import {QUESTIONS_PER_GAME,emptyQuiz,shuffle,createDeck,quizReducer} from './quiz.mjs';

test('three difficulty banks include varied topics, distinct answers and globally unique IDs',()=>{
  assert.deepEqual(DIFFICULTIES,['Easy','Medium','Hard']);
  const ids=[];
  for(const level of DIFFICULTIES){
    assert.ok(QUESTIONS[level].length>=12);
    assert.ok(new Set(QUESTIONS[level].map(q=>q.topic)).size>=8);
    for(const question of QUESTIONS[level]){
      assert.equal(question.level,level);assert.equal(question.options.length,4);
      assert.equal(new Set(question.options).size,4);
      assert.ok(question.options.includes(question.correct));
      assert.ok(question.explanation.length>=20); ids.push(question.id);
    }
  }
  assert.equal(new Set(ids).size,ids.length);
  assert.equal(Object.keys(QUESTION_BANK).length,3);
});
test('shuffle preserves question identities and supports deterministic RNG',()=>{
  const input=[1,2,3,4,5];
  const shuffled=shuffle(input,()=>.5);
  assert.deepEqual([...shuffled].sort(),input);
  assert.deepEqual(input,[1,2,3,4,5]);
});
test('new games vary their opening even with repeated deterministic RNG',()=>{
  const first=createDeck('Easy',()=>.1);
  const second=createDeck('Easy',()=>.1,first.map(q=>q.id));
  assert.notDeepEqual(first.map(q=>q.id),second.slice(0,5).map(q=>q.id));
});
test('no repeats within a session; feedback and score are immediate',()=>{
  let state=quizReducer(emptyQuiz(),{type:'START',difficulty:'Medium',rng:()=>.32});
  const visited=[];
  while(state.phase==='playing'){
    const current=state.deck[state.index];
    assert.ok(!visited.includes(current.id),`repeated ${current.id}`);
    visited.push(current.id);
    state=quizReducer(state,{type:'ANSWER',answer:current.correct});
    assert.equal(state.score,visited.length);
    assert.equal(state.answered,true);
    assert.match(state.feedback,/Correct!/);
    state=quizReducer(state,{type:'NEXT'});
  }
  assert.equal(visited.length,QUESTIONS_PER_GAME);
  assert.equal(state.score,visited.length);
  assert.equal(new Set(state.seenIds).size,visited.length);
});
test('incorrect answers cannot score twice or skip ahead',()=>{
  let state=quizReducer(emptyQuiz(),{type:'START',difficulty:'Hard'});
  const q=state.deck[0];
  assert.equal(quizReducer(state,{type:'NEXT'}).index,0);
  assert.deepEqual(quizReducer(state,{type:'ANSWER',answer:'invalid'}),state);
  const wrong=q.options.find(option=>option!==q.correct);
  state=quizReducer(state,{type:'ANSWER',answer:wrong});
  assert.equal(state.score,0);assert.match(state.feedback,/Correct answer:/);
  assert.equal(quizReducer(state,{type:'ANSWER',answer:q.correct}).score,0);
  assert.equal(quizReducer(state,{type:'NEXT'}).index,1);
  assert.equal(quizReducer(state,{type:'STOP'}).phase,'choose');
});
test('invalid difficulty is rejected cleanly',()=>assert.throws(()=>createDeck('Extreme'),RangeError));
