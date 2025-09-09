import HistoryService from './historyService.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- App State ---
    let currentBookData = null;
    let imageMap = {};
    let booksManifest = [];

    // --- DOM Elements ---
    const dateElement = document.getElementById('current-date');
    const mainNav = document.getElementById('main-nav');
    const bookTocContainer = document.getElementById('book-toc');
    const questionArea = document.getElementById('question-area');
    const bookListContainer = document.getElementById('book-list-container');
    const bookSelectionView = document.getElementById('book-selection-view');
    const bookBrowseView = document.getElementById('book-browse-view');
    const backToBooksBtn = document.getElementById('back-to-books-btn');
    const downloadHistoryBtn = document.getElementById('download-history-btn');
    const createExamBtn = document.getElementById('create-exam-btn');
    const examWizardModal = document.getElementById('exam-wizard-modal');
    const examWizardCloseBtn = document.getElementById('exam-wizard-close-btn');
    const examWizardEntryView = document.getElementById('exam-wizard-entry-view');

    // Fast Template Wizard Elements
    const fastTemplateWizardView = document.getElementById('fast-template-wizard-view');
    const fastTemplateCard = document.getElementById('fast-template-card');
    const wizardBackBtn = document.getElementById('wizard-back-btn');
    const fastBookSelect = document.getElementById('fast-book-select');
    const fastSeasonsContainer = fastTemplateWizardView.querySelector('.mt-2.space-y-2');
    const createFastTemplateBtn = fastTemplateWizardView.querySelector('button.px-6');


    const navLinks = {
        dashboard: document.getElementById('nav-dashboard'),
        myExams: document.getElementById('nav-my-exams'),
        studyMode: document.getElementById('nav-study-mode'),
        settings: document.getElementById('nav-settings'),
    };

    const views = {
        dashboard: document.getElementById('dashboard-view'),
        myExams: document.getElementById('my-exams-view'),
        studyMode: document.getElementById('study-mode-view'),
        settings: document.getElementById('settings-view'),
    };

    // --- Date Logic ---
    if (dateElement) {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }

    // --- View Switching ---
    function setActiveView(viewName) {
        Object.values(views).forEach(view => {
            if(view) view.classList.add('hidden');
        });
        mainNav.querySelectorAll('a').forEach(link => link.classList.remove('bg-gray-700'));
        if (views[viewName]) views[viewName].classList.remove('hidden');
        if (navLinks[viewName]) navLinks[viewName].classList.add('bg-gray-700');
    }

    // --- Study Mode Sub-views ---
    function showBookSelection() {
        currentBookData = null;
        imageMap = {};
        bookTocContainer.innerHTML = '';
        questionArea.innerHTML = '<h1 class="text-2xl font-bold text-gray-800 mb-6">Select a chapter to begin</h1>';
        bookSelectionView.classList.remove('hidden');
        bookBrowseView.classList.add('hidden');
    }

    function showBookBrowse() {
        bookSelectionView.classList.add('hidden');
        bookBrowseView.classList.remove('hidden');
    }

    // --- Navigation ---
    navLinks.dashboard.addEventListener('click', (e) => {
        e.preventDefault();
        setActiveView('dashboard');
    });

    navLinks.myExams.addEventListener('click', (e) => {
        e.preventDefault();
        setActiveView('myExams');
    });

    navLinks.studyMode.addEventListener('click', (e) => {
        e.preventDefault();
        setActiveView('studyMode');
        showBookSelection();
        if (booksManifest.length === 0) loadManifest();
    });

    navLinks.settings.addEventListener('click', (e) => {
        e.preventDefault();
        setActiveView('settings');
    });

    // --- Exam Wizard Modal ---
    function showExamWizard() {
        examWizardEntryView.classList.remove('hidden');
        fastTemplateWizardView.classList.add('hidden');
        examWizardModal.classList.remove('hidden');
    }

    function hideExamWizard() {
        examWizardModal.classList.add('hidden');
    }

    createExamBtn.addEventListener('click', showExamWizard);
    examWizardCloseBtn.addEventListener('click', hideExamWizard);
    wizardBackBtn.addEventListener('click', () => {
        examWizardEntryView.classList.remove('hidden');
        fastTemplateWizardView.classList.add('hidden');
    });
    fastTemplateCard.addEventListener('click', () => {
        examWizardEntryView.classList.add('hidden');
        fastTemplateWizardView.classList.remove('hidden');
        initFastTemplateWizard();
    });

    // --- Fast Template Wizard Logic ---
    function initFastTemplateWizard() {
        // Populate book selection dropdown
        if (booksManifest.length === 0) {
            loadManifest().then(() => populateFastTemplateBookSelect());
        } else {
            populateFastTemplateBookSelect();
        }
    }

    function populateFastTemplateBookSelect() {
        fastBookSelect.innerHTML = '';
        booksManifest.forEach(book => {
            const option = document.createElement('option');
            option.value = book.id;
            option.textContent = book.title;
            fastBookSelect.appendChild(option);
        });
        // Trigger change to load seasons for the first book
        fastBookSelect.dispatchEvent(new Event('change'));
    }

    fastBookSelect.addEventListener('change', async (e) => {
        const bookId = e.target.value;
        fastSeasonsContainer.innerHTML = '<p class="text-xs text-gray-500">Loading seasons...</p>';
        try {
            const response = await fetch(`library/${bookId}/annotations.json`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const bookData = await response.json();

            fastSeasonsContainer.innerHTML = '';
            bookData.children.forEach(season => {
                const label = document.createElement('label');
                label.className = 'flex items-center';
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'h-4 w-4 text-blue-600 border-gray-300 rounded';
                checkbox.value = season.final_id;
                const span = document.createElement('span');
                span.className = 'ml-3 text-sm text-gray-700';
                span.textContent = season.title;
                label.appendChild(checkbox);
                label.appendChild(span);
                fastSeasonsContainer.appendChild(label);
            });
        } catch (error) {
            console.error(`Failed to load seasons for ${bookId}:`, error);
            fastSeasonsContainer.innerHTML = '<p class="text-xs text-red-500">Could not load seasons.</p>';
        }
    });

    createFastTemplateBtn.addEventListener('click', () => {
        const selectedSeasons = Array.from(fastSeasonsContainer.querySelectorAll('input:checked'))
                                     .map(cb => cb.value);

        const templateConfig = {
            type: 'Fast',
            bookId: fastBookSelect.value,
            seasons: selectedSeasons,
            timingMode: document.getElementById('fast-timing-mode').value,
            questionsPerSession: document.getElementById('fast-questions-per-session').value,
            name: document.getElementById('fast-template-name').value,
        };

        if (!templateConfig.name) {
            alert('Please enter a name for the template.');
            return;
        }
        if (selectedSeasons.length === 0) {
            alert('Please select at least one season.');
            return;
        }

        console.log('Creating Fast Template with config:', templateConfig);
        alert(`Template "${templateConfig.name}" created! (Check console for details)`);
        hideExamWizard();
    });


    // --- Data Loading & Display ---
    async function loadManifest() {
        try {
            bookListContainer.innerHTML = '<p class="text-gray-500">Loading books...</p>';
            const response = await fetch('library/manifest.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const manifest = await response.json();
            booksManifest = manifest.books;
            renderBookSelection();
        } catch (error) {
            console.error('Failed to load manifest:', error);
            bookListContainer.innerHTML = '<p class="text-red-500">Could not load books.</p>';
        }
    }

    function renderBookSelection() {
        bookListContainer.innerHTML = '';
        booksManifest.forEach(book => {
            const card = document.createElement('div');
            card.className = 'bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer';
            card.dataset.id = book.id;
            const title = document.createElement('h3');
            title.className = 'text-xl font-bold mb-2';
            title.textContent = book.title;
            card.appendChild(title);
            bookListContainer.appendChild(card);
        });
    }

    async function loadBook(bookId) {
        try {
            bookTocContainer.innerHTML = '<p class="text-gray-500">Loading book...</p>';
            questionArea.innerHTML = '';
            showBookBrowse();
            const response = await fetch(`library/${bookId}/annotations.json`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const bookData = await response.json();
            currentBookData = bookData;
            imageMap = {};
            function traverseAndMap(node) {
                if (node.annotations) {
                    node.annotations.forEach(annotation => {
                        if (annotation.final_id) {
                            const filename = `${annotation.final_id}.png`;
                            imageMap[filename] = `library/${bookId}/images/${filename}`;
                        }
                    });
                }
                if (node.children) node.children.forEach(traverseAndMap);
            }
            traverseAndMap(bookData);
            renderToc(bookData, bookTocContainer);
        } catch (error) {
            console.error("Failed to load book:", error);
            bookTocContainer.innerHTML = `<p class="text-red-500">Failed to load ${bookId}.</p>`;
        }
    }

    function renderToc(rootNode, container) {
        container.innerHTML = '';
        const ul = document.createElement('ul');
        function buildToc(node, parentUl, level = 0) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = node.title;
            a.dataset.finalId = node.final_id;
            a.style.paddingLeft = `${level * 1.5}rem`;
            a.className = 'block p-2 rounded hover:bg-gray-200';
            if (node.annotations && node.annotations.some(ann => ann.type === 'Q')) {
                a.classList.add('cursor-pointer');
            } else {
                a.classList.add('font-bold', 'text-gray-500');
            }
            li.appendChild(a);
            parentUl.appendChild(li);
            if (node.children && node.children.length > 0) {
                const childUl = document.createElement('ul');
                li.appendChild(childUl);
                node.children.forEach(child => buildToc(child, childUl, level + 1));
            }
        }
        buildToc(rootNode, ul);
        container.appendChild(ul);
    }

    function displayStudyContent(chapterNode) {
        questionArea.innerHTML = '';
        const header = document.createElement('h1');
        header.className = 'text-2xl font-bold text-gray-800 mb-6';
        header.textContent = chapterNode.title;
        questionArea.appendChild(header);

        // Group annotations by question number (NNN in the final_id)
        const contentByQuestion = {};
        if (chapterNode.annotations) {
            chapterNode.annotations.forEach(ann => {
                const qNum = ann.final_id.substring(7, 10);
                if (!contentByQuestion[qNum]) {
                    contentByQuestion[qNum] = { Q: null, E: [], F: [] };
                }
                if (ann.type === 'Q') contentByQuestion[qNum].Q = ann;
                else if (ann.type === 'E') contentByQuestion[qNum].E.push(ann);
                else if (ann.type === 'F') contentByQuestion[qNum].F.push(ann);
            });
        }

        const questionKeys = Object.keys(contentByQuestion).filter(key => contentByQuestion[key].Q);

        if (questionKeys.length === 0) {
            questionArea.innerHTML += '<p class="text-gray-500">No questions in this section.</p>';
            return;
        }

        questionKeys.forEach(qNum => {
            const content = contentByQuestion[qNum];
            const question = content.Q;

            const questionBlock = document.createElement('div');
            questionBlock.className = 'bg-white p-6 rounded-lg shadow-md mb-6';
            questionBlock.dataset.questionId = question.final_id;
            questionBlock.dataset.correctAnswer = question.correctAnswer;

            const qFilename = `${question.final_id}.png`;
            if (imageMap[qFilename]) {
                const img = document.createElement('img');
                img.src = imageMap[qFilename];
                img.alt = `Question ${question.final_id}`;
                img.className = 'w-full rounded-md';
                questionBlock.appendChild(img);
            }

            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'mt-4 flex items-center justify-between';
            const answerButtons = document.createElement('div');
            answerButtons.className = 'flex space-x-2';
            for (let i = 1; i <= 4; i++) {
                const button = document.createElement('button');
                button.className = 'answer-btn px-4 py-2 bg-gray-200 rounded hover:bg-blue-500 hover:text-white transition';
                button.textContent = `${i}`;
                button.dataset.answer = i;
                answerButtons.appendChild(button);
            }
            optionsDiv.appendChild(answerButtons);

            const checkAnswerBtn = document.createElement('button');
            checkAnswerBtn.className = 'check-answer-btn px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition';
            checkAnswerBtn.textContent = 'Check Answer';
            optionsDiv.appendChild(checkAnswerBtn);
            questionBlock.appendChild(optionsDiv);

            // Add hidden container for explanations
            const explanationContainer = document.createElement('div');
            explanationContainer.className = 'explanation-container hidden mt-4 border-t pt-4';
            content.E.forEach(exp => {
                const expFilename = `${exp.final_id}.png`;
                if (imageMap[expFilename]) {
                    const expImg = document.createElement('img');
                    expImg.src = imageMap[expFilename];
                    expImg.alt = `Explanation for ${question.final_id}`;
                    expImg.className = 'w-full rounded-md mt-2';
                    explanationContainer.appendChild(expImg);
                }
            });
            questionBlock.appendChild(explanationContainer);

            questionArea.appendChild(questionBlock);
        });
    }

    // --- Event Listeners ---
    bookListContainer.addEventListener('click', e => {
        const card = e.target.closest('[data-id]');
        if (card) loadBook(card.dataset.id);
    });

    bookTocContainer.addEventListener('click', e => {
        e.preventDefault();
        const link = e.target.closest('a');
        if (!link || !link.dataset.finalId) return;
        const finalId = link.dataset.finalId;
        let selectedNode = null;
        function findNode(node) {
            if (selectedNode) return;
            if (node.final_id === finalId) selectedNode = node;
            if (node.children) node.children.forEach(findNode);
        }
        findNode(currentBookData);
        if (selectedNode) displayStudyContent(selectedNode);
    });

    backToBooksBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showBookSelection();
    });

    downloadHistoryBtn.addEventListener('click', () => {
        const history = HistoryService.getStudyHistory();
        if (history.length === 0) {
            alert("No history to download.");
            return;
        }
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "medquest_history.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    questionArea.addEventListener('click', e => {
        const questionBlock = e.target.closest('[data-question-id]');
        if (!questionBlock || e.target.closest('.explanation-container')) return;

        if (e.target.matches('.answer-btn')) {
            questionBlock.querySelectorAll('.answer-btn').forEach(btn => btn.classList.remove('bg-blue-500', 'text-white'));
            e.target.classList.add('bg-blue-500', 'text-white');
            questionBlock.dataset.selectedAnswer = e.target.dataset.answer;
        }

        if (e.target.matches('.check-answer-btn')) {
            const userAnswer = questionBlock.dataset.selectedAnswer;
            if (!userAnswer) {
                alert('Please select an answer first.');
                return;
            }
            const correctAnswer = questionBlock.dataset.correctAnswer;
            const questionId = questionBlock.dataset.questionId;
            const isCorrect = userAnswer === correctAnswer;
            HistoryService.addStudyRecord({ questionId, userAnswer, correctAnswer, isCorrect });

            const allAnswerBtns = questionBlock.querySelectorAll('.answer-btn');
            allAnswerBtns.forEach(btn => {
                btn.disabled = true;
                const answer = btn.dataset.answer;
                if (answer === correctAnswer) {
                    btn.classList.remove('bg-blue-500');
                    btn.classList.add('bg-green-500', 'text-white');
                } else if (answer === userAnswer) {
                    btn.classList.remove('bg-blue-500');
                    btn.classList.add('bg-red-500', 'text-white');
                }
            });
            e.target.disabled = true;
            e.target.textContent = isCorrect ? 'Correct!' : 'Incorrect';

            const explanationContainer = questionBlock.querySelector('.explanation-container');
            if (explanationContainer) explanationContainer.classList.remove('hidden');
        }
    });

    // --- Initialisation ---
    setActiveView('dashboard');
});
