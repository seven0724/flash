function toBaseN(num, base) {
    return num.toString(base).toUpperCase();
}

function toBaseNWithComma(num, base) {
    let str = num.toString(base).toUpperCase();
    // 3桁ごとにカンマ挿入（右から）
    let result = '';
    let count = 0;
    for (let i = str.length - 1; i >= 0; i--) {
        result = str[i] + result;
        count++;
        if (count % 3 === 0 && i !== 0) {
            result = ',' + result;
        }
    }
    return result;
}

let numbers = [];
let currentBase = 10; // デフォルトは10進数
let clickAudio = new Audio('click.mp3');
let correctCount = 0;
let incorrectCount = 0;
let streakCount = 0;
let correctAudio = new Audio('correct_2.mp3');
let incorrectAudio = new Audio('incorrect_2.mp3');
let waitingForStart = true;
let waitingForAnswer = false;
let lastNumbers = [];
let lastDigits = 4;
let lastCount = 5;
let lastBase = 10;
let lastInterval = 500;

function updateStats() {
    const stats = document.getElementById('stats');
    if (stats) {
        stats.textContent = `正解数: ${correctCount}　不正解数: ${incorrectCount}　連続正解数: ${streakCount}`;
    }
}

function generateNumbers(digits, count, base) {
    const min = Math.pow(base, digits-1);
    const max = Math.pow(base, digits) - 1;
    numbers = [];
    currentBase = base;

    for (let i = 0; i < count; i++) {
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        numbers.push(num);
    }

}

function displayNumbers(interval) {
    const display = document.getElementById('display');
    let index = 0;
    display.textContent = '';
    document.querySelector('.answer-section').style.display = 'none';
    waitingForStart = false;
    waitingForAnswer = false;

    const showNext = () => {
        if (index < numbers.length) {
            display.style.background = '#222';
            display.textContent = '';
            setTimeout(() => {
                display.style.background = '';
                display.textContent = toBaseNWithComma(numbers[index], currentBase); // n進数+カンマ
                clickAudio.currentTime = 0;
                //clickAudio.play();
                index++;
                setTimeout(showNext, interval);
            }, 100); // 0.1秒暗転
        } else {
            display.style.background = '';
            display.textContent = '?';
            document.querySelector('.answer-section').style.display = 'block';
            // 回答入力欄に自動フォーカス
            const input = document.getElementById('answerInput');
            input.focus();
            input.select();
            waitingForAnswer = true;
        }
    };
    showNext();
}

function setLastProblem(digits, count, base, interval) {
    lastNumbers = [...numbers];
    lastDigits = digits;
    lastCount = count;
    lastBase = base;
    lastInterval = interval;
}

function showLastProblem() {
    numbers = [...lastNumbers];
    currentBase = lastBase;
    displayNumbers(lastInterval);
}

// Enterキーでスタート・答え合わせ
window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (waitingForStart && document.activeElement !== document.getElementById('answerInput')) {
            document.getElementById('startBtn').click();
        } else if (waitingForAnswer && document.activeElement === document.getElementById('answerInput')) {
            document.getElementById('checkAnswerBtn').click();
        } else if (!waitingForStart && !waitingForAnswer) {
            document.getElementById('startBtn').click();
        }
    }
});

document.getElementById('startBtn').addEventListener('click', () => {
    // 入力欄と判定をリフレッシュ
    document.getElementById('answerInput').value = '';
    document.getElementById('result').textContent = '';

    const digits = parseInt(document.getElementById('digits').value);
    const count = parseInt(document.getElementById('count').value);
    const interval = parseInt(document.getElementById('interval').value);
    const base = parseInt(document.getElementById('base').value); // n進数取得

    generateNumbers(digits, count, base);
    setLastProblem(digits, count, base, interval);
    displayNumbers(interval);
});

document.getElementById('checkAnswerBtn').addEventListener('click', () => {
    const userAnswer = parseInt(document.getElementById('answerInput').value, currentBase); // n進数で解釈
    const correctAnswer = numbers.reduce((sum, num) => sum + num, 0);
    const result = document.getElementById('result');

    if (userAnswer === correctAnswer) {
        result.textContent = `正解！ 合計は ${toBaseNWithComma(correctAnswer, currentBase)} です。`;
        correctCount++;
        streakCount++;
        correctAudio.currentTime = 0;
        //correctAudio.play();
    } else {
        result.textContent = `不正解。正解は ${toBaseNWithComma(correctAnswer, currentBase)} です。`;
        incorrectCount++;
        streakCount = 0;
        incorrectAudio.currentTime = 0;
        //incorrectAudio.play();
    }
    waitingForAnswer = false;
    waitingForStart = true;
    updateStats();
});

// やり直しボタンのイベント
if (!document.getElementById('retryBtn')) {
    const retryBtn = document.createElement('button');
    retryBtn.id = 'retryBtn';
    retryBtn.textContent = 'やり直し';
    retryBtn.style.marginLeft = '10px';
    document.querySelector('.controls').appendChild(retryBtn);
    retryBtn.addEventListener('click', () => {
        document.getElementById('answerInput').value = '';
        document.getElementById('result').textContent = '';
        showLastProblem();
    });
}
