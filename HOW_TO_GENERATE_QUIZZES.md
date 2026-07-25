# How to Generate Quizzes for New Classes

When new class materials are added, the Visharad App can automatically generate matching quizzes and mini-reviews (every 5 classes) using an AI generation script. Follow these steps to correctly upload content and generate the corresponding quizzes.

## Step 1: Upload the Class Content
1. Prepare your class text. Ensure it is nicely formatted.
2. Name the file using the exact format `Class_<number>.txt` (e.g., `Class_34.txt`). Capital "C" and underscore are required.
3. Place this file directly in the `public/` directory:
   `public/Class_34.txt`

## Step 2: Update the Classes Configuration
1. Open the `public/classes.json` file.
2. Add a new object for your new class at the bottom of the JSON array, maintaining the existing structure:
   ```json
   {
       "id": "34",
       "file": "Class_34.txt",
       "title": "Class 34"
   }
   ```
3. Save the file. This ensures the frontend application knows the class exists and can properly display it in the list.

## Step 3: Run the Quiz Generator Script
1. The quiz generator uses the Gemini API. Ensure you have a `.env.local` file in your root workspace containing your API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```
2. Open a terminal in the root of the project.
3. Run the generator script, providing the starting class number as an argument. For example, if you uploaded Class 34 and want to generate quizzes from Class 34 onwards, run:
   ```bash
   npx tsx tools/scripts/generate-quizzes.ts 34
   ```
4. Wait for the script to finish. The script will output its progress to the console. It takes some time as it makes requests to the AI to build multiple-choice questions.

## Step 4: Verify the Generated Quizzes
1. Navigate to the `public/quizzes/` directory.
2. You should see a new file named `class_34.json`. 
3. *Note:* If the class number is a multiple of 5 (e.g., 35), the script will automatically generate an additional `mini_review_<number>.json` file pooling questions from the recent classes.
4. Briefly open the generated JSON file(s) to ensure questions, options, and explanations are correctly populated.

## Step 5: Commit and Deploy
1. Test your application locally (`npm run dev`) to ensure the new class text and quiz load without issues.
2. Add and commit all changed files (the text file, updated `classes.json`, and new quiz JSONs) to Git and push to your repository to deploy.
