// A simple in-memory history service for now.
// In the future, this could be backed by LocalStorage or a remote database.

const studyHistory = [];

const HistoryService = {
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
        console.log("Current Study History:", studyHistory);
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
