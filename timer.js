let time = document.getElementById('time');
let bc = document.getElementById('bc');
let sc = document.getElementById('sc');
let dot = document.querySelector('.dot');
let btn = document.getElementById('timer-start');

// Initialisation variables 
let nb_question = 2;
let no_question = 0;
let max;
let count;

// Exemple question :
let question_theme = 'Géographie';
let question_text = 'Quel est le pays qui compte le plus de lacs ?';
showQuestion(5, question_theme, question_text, '');

function showQuestion(question_max,question_theme,question_text,question_answer){
    max = question_max;
    count = max;
    resetTimer(max);

    let question_nb_span = document.getElementById('question-nb');
    no_question++;
    question_nb_span.innerHTML = `Question ${no_question}/${nb_question}`

    let question_theme_span = document.getElementById('question-theme');
    question_theme_span.innerHTML = question_theme;

    let question_text_span = document.getElementById('question-text');
    question_text_span.innerHTML = `${question_text}`;
}
function start(){
    btn.style.visibility = 'hidden';
    timer = setInterval(function(){
        count--;
        if (count == -1) {
            btn.style.visibility = 'visible';
            nextQuestion();
        }
        time.innerHTML = count;
        bc.style.stroke = 'var(--box)';

        sc.style.strokeDashoffset = (314 * count) / max;
        dot.style.transform = `rotateZ(${(max-count) / max * 360}deg)`;

        sc.style.transition = 'linear 1s';
        dot.style.transition = 'linear 1s';

    }, 1000);
}

function resetTimer(count){
    time.innerHTML = count;
    bc.style.stroke = 'var(--box)';
    dot.style.stroke = 'var(--grn)';
    sc.style.transition = 'none';
    dot.style.transition = 'none';
    sc.style.strokeDashoffset = 314;
}

function nextQuestion(){
    // remplir
    max = 5;
    question_theme = 'Histoire';
    question_text = 'En quelle année Auguste a-t-il été sacré empereur ?'
    showQuestion(max, question_theme, question_text, '');
    resetTimer(max)
    clearInterval(timer);
    count = max;
    if (no_question <= nb_question) {
        start()
    }
    else {
        return;
    }
}