const HISTORY_STORAGE_KEY = 'medquest_study_history';

// Load initial history from LocalStorage
let studyHistory = [];
try {
    const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (storedHistory) {
        studyHistory = JSON.parse(storedHistory);
    }
} catch (e) {
    console.error("Could not load study history from LocalStorage", e);
    studyHistory = [];
}


const HistoryService = {
    _save: () => {
        try {
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(studyHistory));
        } catch (e) {
            console.error("Could not save study history to LocalStorage", e);
        }
    },

    /**
     * Adds a new study record to the history.
     * @param {object} record - The record to add.
     * @param {string} record.questionId - The final_id of the question.
     * @param {string} record.userAnswer - The answer selected by the user.
     * @param {string} record.correctAnswer - The correct answer.
     * @param {boolean} record.isCorrect - Whether the user's answer was correct.
     */
    addStudyRecord: (record) => {
        const newRecord = {
            ...record,
            timestamp: new Date().toISOString(),
        };
        studyHistory.push(newRecord);
        console.log("Record added:", newRecord);
        HistoryService._save(); // Save after adding a record
    },

    /**
     * Retrieves the entire study history.
     * @returns {Array<object>} The study history.
     */
    getStudyHistory: () => {
        return [...studyHistory]; // Return a copy to prevent mutation
    },

    /**
     * Retrieves all records for a specific question.
     * @param {string} questionId - The final_id of the question.
     * @returns {Array<object>} The history for that question.
     */
    getHistoryForQuestion: (questionId) => {
        return studyHistory.filter(record => record.questionId === questionId);
    },
};

export default HistoryService;
