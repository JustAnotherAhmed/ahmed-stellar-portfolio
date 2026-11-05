/** Pure state machine for the optional multiple-choice AI knowledge quiz. */
export const QUESTIONS = Object.freeze([
  {
    "level": "Easy",
    "question": "What does AI stand for?",
    "options": [
      "Automated Internet",
      "Artificial Intelligence",
      "Adaptive Interface",
      "Advanced Integration"
    ],
    "correct": "Artificial Intelligence",
    "explanation": "AI refers to computer systems performing tasks associated with human intelligence."
  },
  {
    "level": "Easy",
    "question": "Which of these is an example of computer vision?",
    "options": [
      "Recognizing objects in photos",
      "Compressing a ZIP file",
      "Sending an email",
      "Changing a password"
    ],
    "correct": "Recognizing objects in photos",
    "explanation": "Computer vision helps systems interpret images and video."
  },
  {
    "level": "Intermediate",
    "question": "What is supervised machine learning?",
    "options": [
      "Training only on unlabeled data",
      "Training with labeled examples",
      "Writing every rule by hand",
      "Running a model without data"
    ],
    "correct": "Training with labeled examples",
    "explanation": "Supervised learning uses examples paired with known labels or target values."
  },
  {
    "level": "Intermediate",
    "question": "What does RAG add to a language-model workflow?",
    "options": [
      "Guaranteed factual answers",
      "Retrieved external context",
      "A larger GPU",
      "A new programming language"
    ],
    "correct": "Retrieved external context",
    "explanation": "Retrieval-augmented generation supplies relevant retrieved content to help ground a model response."
  },
  {
    "level": "Hard",
    "question": "Why is data leakage dangerous when evaluating a model?",
    "options": [
      "It removes all features",
      "It can make test results overly optimistic",
      "It forces gradient descent to stop",
      "It always decreases accuracy"
    ],
    "correct": "It can make test results overly optimistic",
    "explanation": "Information from evaluation data can inadvertently influence training, inflating measured performance."
  },
  {
    "level": "Hard",
    "question": "What is a text embedding?",
    "options": [
      "An image of a word",
      "A numeric vector representing aspects of meaning",
      "An encrypted password",
      "A handwritten prompt template"
    ],
    "correct": "A numeric vector representing aspects of meaning",
    "explanation": "Embeddings represent content numerically, making similarity and retrieval operations possible."
  },
  {
    "level": "Extreme",
    "question": "In scaled dot-product attention, why divide QKᵀ by √dₖ?",
    "options": [
      "To reduce large dot products before softmax",
      "To remove positional information",
      "To ensure every token gets equal attention",
      "To turn attention into convolution"
    ],
    "correct": "To reduce large dot products before softmax",
    "explanation": "Scaling helps prevent softmax from saturating when dot-product magnitudes grow with key dimension."
  },
  {
    "level": "Extreme",
    "question": "Which evaluation best detects unsupported claims in a RAG answer?",
    "options": [
      "Count the number of tokens",
      "Check answer faithfulness against retrieved evidence",
      "Measure only model latency",
      "Compare font sizes in source documents"
    ],
    "correct": "Check answer faithfulness against retrieved evidence",
    "explanation": "Faithfulness checks whether generated claims are supported by the retrieved context."
  }
]);
export const LEVELS = Object.freeze(['Easy', 'Intermediate', 'Hard', 'Extreme']);
export const initialGame = ()=>({phase:"idle",round:0,score:0,answered:false,selected:null,feedback:""});
export function updateGame(state, action) {
  if (action.type === 'START' || action.type === 'RESTART') return { ...initialGame(), phase: 'playing' };
  if (action.type === 'EXIT') return initialGame();
  if (state.phase !== 'playing') return state;
  const current = QUESTIONS[state.round];
  if (!current) return initialGame();
  if (action.type === 'ANSWER') {
    if (state.answered || !current.options.includes(action.answer)) return state;
    const correct = action.answer === current.correct;
    return { ...state, answered: true, selected: action.answer,
      score: state.score + (correct ? 1 : 0),
      feedback: `${correct ? 'Correct!' : `Correct answer: ${current.correct}.`} ${current.explanation}` };
  }
  if (action.type === 'NEXT' && state.answered) {
    if (state.round === QUESTIONS.length - 1) return { ...state, phase: 'complete' };
    return { ...state, round: state.round + 1, answered: false, selected: null, feedback: '' };
  }
  return state;
}
