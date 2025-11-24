import { fallbackQuestions } from '@/data/fallback-questions';
import type { Question } from '@/types/game';

/**
 * Get a random fallback question for the given category
 * Avoids questions that have already been asked this game
 */
export function getFallbackQuestion(
	categoryId: string,
	categoryName: string,
	usedQuestions: string[]
): Question | null {
	const questions = fallbackQuestions[categoryName];

	if (!questions || questions.length === 0) {
		// Try to find questions from any category if specified category doesn't exist
		const allCategories = Object.keys(fallbackQuestions);
		if (allCategories.length === 0) return null;

		const randomCategory =
			allCategories[Math.floor(Math.random() * allCategories.length)];
		return getFallbackQuestion(categoryId, randomCategory, usedQuestions);
	}

	// Filter out already used questions
	const availableQuestions = questions.filter(
		(q) => !usedQuestions.includes(q.text)
	);

	// If all questions have been used, allow repeats
	const questionsPool =
		availableQuestions.length > 0 ? availableQuestions : questions;

	// Pick a random question
	const randomQuestion =
		questionsPool[Math.floor(Math.random() * questionsPool.length)];

	// Generate a unique ID for this question
	const questionId = `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

	return {
		id: questionId,
		text: randomQuestion.text,
		answers: randomQuestion.answers,
		correctAnswerId: randomQuestion.correctAnswerId,
		categoryId
	};
}

/**
 * Check if a category has fallback questions available
 */
export function hasFallbackQuestions(categoryName: string): boolean {
	return (
		fallbackQuestions[categoryName] !== undefined &&
		fallbackQuestions[categoryName].length > 0
	);
}
