document.addEventListener('DOMContentLoaded', () => {
    // --- App State ---
    let currentBookData = null;
    let imageMap = {};

    // --- DOM Elements ---
    const dateElement = document.getElementById('current-date');
    const mainNav = document.getElementById('main-nav');
    const bookTocContainer = document.getElementById('book-toc');
    const questionArea = document.getElementById('question-area');

    const navLinks = {
        dashboard: document.getElementById('nav-dashboard'),
        studyMode: document.getElementById('nav-study-mode'),
    };

    const views = {
        dashboard: document.getElementById('dashboard-view'),
        studyMode: document.getElementById('study-mode-view'),
    };

    // --- Date Logic ---
    if (dateElement) {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }

    // --- View Switching ---
    function setActiveView(viewName) {
        Object.values(views).forEach(view => view.classList.add('hidden'));
        mainNav.querySelectorAll('a').forEach(link => link.classList.remove('bg-gray-700'));

        if (views[viewName]) views[viewName].classList.remove('hidden');
        if (navLinks[viewName]) navLinks[viewName].classList.add('bg-gray-700');
    }

    navLinks.dashboard.addEventListener('click', (e) => {
        e.preventDefault();
        setActiveView('dashboard');
    });

    navLinks.studyMode.addEventListener('click', (e) => {
        e.preventDefault();
        setActiveView('studyMode');
        if (!currentBookData) loadBook('gastroenterology');
    });

    // --- Data Loading ---
    async function loadBook(bookId) {
        try {
            bookTocContainer.innerHTML = '<p class="text-gray-500">Loading book...</p>';
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
            bookTocContainer.innerHTML = '<p class="text-red-500">Failed to load book. See console for details.</p>';
        }
    }

    // --- Display Logic ---
    function renderToc(rootNode, container) {
        container.innerHTML = ''; // Clear previous TOC
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

        const questions = chapterNode.annotations.filter(ann => ann.type === 'Q');
        if (questions.length === 0) {
            questionArea.innerHTML += '<p class="text-gray-500">No questions in this section.</p>';
            return;
        }

        questions.forEach(question => {
            const questionBlock = document.createElement('div');
            questionBlock.className = 'bg-white p-6 rounded-lg shadow-md mb-6';

            const filename = `${question.final_id}.png`;
            const imgSrc = imageMap[filename];

            if (imgSrc) {
                const img = document.createElement('img');
                img.src = imgSrc;
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
                button.className = 'px-4 py-2 bg-gray-200 rounded hover:bg-blue-500 hover:text-white transition';
                button.textContent = `${i}`;
                answerButtons.appendChild(button);
            }
            optionsDiv.appendChild(answerButtons);

            const showAnswerBtn = document.createElement('button');
            showAnswerBtn.className = 'px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition';
            showAnswerBtn.textContent = 'Show Answer';
            optionsDiv.appendChild(showAnswerBtn);

            questionBlock.appendChild(optionsDiv);
            questionArea.appendChild(questionBlock);
        });
    }

    // --- Event Listeners ---
    bookTocContainer.addEventListener('click', e => {
        e.preventDefault();
        const link = e.target.closest('a');
        if (!link || !link.dataset.finalId) return;

        const finalId = link.dataset.finalId;
        let selectedNode = null;
        function findNode(node) {
            if (selectedNode) return;
            if (node.final_id === finalId) {
                selectedNode = node;
                return;
            }
            if (node.children) node.children.forEach(findNode);
        }
        findNode(currentBookData);

        if (selectedNode && selectedNode.annotations) {
            displayStudyContent(selectedNode);
        }
    });

    // --- Initialisation ---
    setActiveView('dashboard');
});
