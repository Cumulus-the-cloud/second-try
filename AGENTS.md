# MedQuest App Development Guidelines

This document contains important information and guidelines for the development of the MedQuest application.

## High-Level Features

- **Dashboard:** Main page with an overview of study activities.
- **My Exams:** A powerful "Exam Wizard" to create custom exams from question banks (books).
- **Study Mode:** For browsing questions from books.
- **Schedule:** A calendar to drag and drop exam templates.
- **Analytics:** To review session results.
- **Settings:** For application settings.

## Data Structure: 11-Digit ID

- **Structure:** `Type BB SS TQ NNN Part`
- **Type (1 digit):**
    - `1`: Structural/Container Files (Book, Season, Topic headers)
    - `2`: Questions (Q)
    - `3`: Extended Answers (E)
    - `4`: Follow-ups/Summaries (F)
- **BB (Book Number):** 2 digits (e.g., `01`)
- **SS (Season Number):** 2 digits (e.g., `01`)
- **TQ (Topic Number):** 2 digits (e.g., `01`). `00` if a season has no explicit sub-topics.
- **NNN (Question Number Reference):** 3 digits.
    - For `Q` items: The absolute question number (e.g., `Q1` -> `001`).
    - For `E` items: The question number it refers to (e.g., `E5` refers to `Q5` -> `005`).
    - For `F` items: `000` (refer to the topic level).
    - For structural files (Type `1`): `000`.
- **Part (1 digit):** The "file number" for sequential parts of an item.
    - `0`: For the primary/main part of an item or for structural files.
    - `1, 2, 3, ...`: For sequential parts of an item.

### Sample Data with 11-Digit IDs

```
بانک سوال گوارش و کبد -> 10100000000
1- درد شکمی و سوء جذب -> 10101000000
25 سوال جمعا
1) تشخیص و سوء جذب -> 10101010000
5 سوال
Q1=1 -> 20101010010
E1 -> 30101010011
Q2=1 -> 20101010020
Q3=1 -> 20101010030
Q4=4 -> 20101010040
Q5=2 -> 20101010050
E5(1) -> 30101010051
E5(2) -> 30101010052
E5(3) -> 30101010053
2) چگونگی برخورد با سوء جذب -> 10101020000
3 سوال
Q6=2 -> 20101020060
E6(1) -> 30101020061
E6(2) -> 30101020062
Q7=2 -> 20101020070
E7(1) -> 30101020071
E7(2) -> 30101020072
Q8=3 -> 20101020080
E8 -> 30101020081
F6(1) -> 40101020001
F6(2) -> 40101020002
3) بیماری سلیاک -> 10101030000
14 سوال
Q9=4 -> 20101030090
E9(1) -> 30101030091
E9(2) -> 30101030092
E9(3) -> 30101030093
E9(4) -> 30101030094
Q10=4 -> 20101030100
E10 -> 30101030101
Q11=3 -> 20101030110
E11 -> 30101030111
Q12=3 -> 20101030120
E12 -> 30101030121
Q13=4 -> 20101030130
E13(1) -> 30101030131
E13(2) -> 30101030132
Q14=3 -> 20101030140
E14 -> 30101030141
Q15=1 -> 20101030150
Q16=3 -> 20101030160
E16 -> 30101030161
Q17=2 -> 20101030170
E17 -> 30101030171
Q18=4 -> 20101030180
E18 -> 30101030181
Q19=2 -> 20101030190
Q20=4 -> 20101030200
E20 -> 30101030201
Q21=1 -> 20101030210
E21 -> 30101030211
Q22=1 -> 20101030220
E22 -> 30101030221
4) سندرم رشد بیش از حد باکتری ها -> 10101040000
3 سوال
Q23=2 -> 20101040230
E23(1) -> 30101040231
E23(2) -> 30101040232
E23(3) -> 30101040233
Q24=4 -> 20101040240
E24 -> 30101040241
Q25=2 -> 20101040250
F23(1) -> 40101040001
F23(2) -> 40101040002
F23(3) -> 40101040003
2- اسهال و یبوست -> 10102000000
3- خونریزی های گوارشی -> 10103000000
4- بیماری های مری -> 10104000000
5- زخم پپتیک -> 10105000000
6- سندرم روده ی تحریک پذیر -> 10106000000
7- بیماری های التهابی روده -> 10107000000
8- تومور های دستگاه گوارش -> 10108000000
9- بیماری های پانکراس -> 10109000000
10- اختلالات کیسه ی صفرا و مجاری صفراوی -> 10110000000
11- روش برخورد با بیماری های کبدی -> 10111000000
12- زردی -> 10112000000
13- هیپربیلی روبینمی ها -> 10113000000
14- هپاتیت حاد ویروسی -> 10114000000
15- نارسایی حاد کلیه -> 10115000000
```

## Exam Wizard Rules

### **Custom Template Rules**
- **Content Source & Selection:**
    - Use the available library books as a Question Bank.
    - Provide a folder-ticking UI for selection.
    - The selection process is hierarchical: Books -> Seasons -> Topics.
    - Include an option to "select all" for both seasons and topics.
- **Smart Pooling Options (Step 3):**
    - **Smart Feature Option 1:** Only include questions the user has never done before.
    - **Smart Feature Option 2 (Past Mistakes):** Include questions that were answered incorrectly the last time they were reviewed, PLUS questions with a wrong-to-tested ratio of more than 50%.
    - **Smart Feature Option 3 (Exempt Confident Questions):** Remove all questions with a true-to-tested ratio above 75%, UNLESS they were answered incorrectly the very last time they were tested.
- **Session Structure (Step 4):**
    - **Timing:** Offer two options: "Time per Exam" and "Time per Question." Both modes calculate 1 minute per question, but "Time per Question" enforces a separate 1-minute timer for each individual question.
    - **Questions Per Session:** The user chooses the number of questions for each session. The app should then display how many total sessions will be created and specify the number of questions in the final, smaller session if the total doesn't divide evenly (e.g., "5 sessions of 20 questions and a session of 10 questions").
    - **Number of Topics Per Session:** An option to limit the number of topics included in a single session to allow for more focused studying.
- **General Features:**
    - An indicator showing the total number of questions in the pool must be visible during all steps.
    - The last step is to choose a name for the template.
- **Dashboard Card:**
    - When finished, a card is created on the dashboard showing necessary information.
    - The card must include a progress bar indicating the number of completed sessions.
    - If the template is not fully completed, the progress bar should have a pulsing glow.

### **Original Exam Rules**
- **Creation Process:**
    - The user first chooses the number of questions to create.
    - The app then provides a template for each question where the user can type the question text, four options, and an explanation in a separate box.
    - A box must be available for the user to set a specific time limit for each question.
- **Finalization:**
    - After creating questions, the user chooses a timing mode ("Time per Question" or "Time per Exam").
    - The user names the exam.
- **Structure:**
    - Original exams are always single-session exams and are not considered templates for generating future sessions.

### **Fast Template Rules**
- **Simplified Setup:**
    - The user can only choose one book.
    - Within that book, the user can only select content at the "Season" level.
    - The user sets the timing mode ("Time per Exam" or "Time per Question").
    - The user sets the number of questions per session.
    - The final step is to name the template.
- **Automatic Features (Non-configurable):**
    - The "Smart Feature" (detailed below) is on by default.
    - Questions with a right-to-tested ratio above 80% are automatically exempted, unless they were answered wrong the last time they were tested.
    - All questions from the past 10 days (240 hours) are automatically exempted from the pool.

### **SMART FEATURE (Question Distribution Logic)**
- **Goal:** To ensure study sessions are diverse and cover multiple topics, preventing the over-representation of a single topic.
- **Topic Weighting:** The system should give weight to topics based on their size. A topic with 40 questions should be treated differently than a topic with 5 questions.
- **Distribution Logic:**
    - The feature ensures a minimum number of questions from each topic is included in a session.
    - **Example 1 (More Topics than Questions):** If a session has 8 questions and 5 topics, the app will first draw one question from each of the 5 topics. Then, it will randomly choose 3 of those topics to draw one additional question from each, for a total of 8.
    - **Example 2 (More Questions than Topics):** If a session has 16 questions and 5 topics, the app will draw one question from each of the 5 topics, repeating this process three times (for a total of 15 questions). For the final 16th question, it will randomly choose one of the 5 topics to draw from.
    - If a topic runs out of questions during this process, it is excluded from subsequent draws.
- **Scattering:** When multiple questions are pulled from the same large topic, they should be scattered. Instead of picking questions 1, 2, 3, and 4, the system should pick questions that are spread out, such as 1, 5, 15, and 20.

## Other Features

- **Schedules:** Features a calendar and a sidebar with active exam templates. Users can drag and drop templates to create sessions.
- **Analytics:** Every completed session appears here with a dedicated result sheet. Completed exam templates are also moved here.
- **Data Recording:** The app must record every interaction with a question (date, time, result: right, wrong, unanswered). It should save all encounters.
- **Study Streak:** The app should record user visits to operate the study streak function.
