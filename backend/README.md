<!-- backend/README.md -->

# Backend

## DB Model

### Collections

**user:**
- `username: String`
- `password: String`
- `superuser: Boolean`

**question:**
- `questionId: String`
- `questionText: String`
- `answerText: String`
- `themeText: String`
- `difficulty: String`

**game:**
- `code: String`
- `creationDate: Date`
- `isStarted: Boolean`
- `isOver: Boolean`
- `options: {`
  - `nbQuestions: String`
  - `filters: String`
  - `questionTime: String`
- `host: String`
- `currentQuestion: String?` _(on sait pas trop si c'est une bonne idée)_
- `questionNumber: String?` _(on sait pas trop si c'est une bonne idée)_
- `players: {`
  - `id : {` 
    - `username: String`
    - `score: Number`
      `}`
    `}`


  
