import { kmClient } from '@/services/km-client';
import type { Category, Question, SelectionType, TrapType } from '@/types/game';
import { soundEffects } from '@/utils/sound-effects';
import { globalStore } from '../stores/global-store';
import { playerStore } from '../stores/player-store';

/**
 * Generate AI-powered trivia questions for a given category
 */
async function generateQuestion(
	categoryName: string,
	askedQuestions: string[] = []
): Promise<Question> {
	const previousQuestionsContext =
		askedQuestions.length > 0
			? `\nDo NOT generate any of these previously asked questions:\n${askedQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
			: '';

	const systemPrompt = `You are a trivia question generator. Generate ONE trivia question about "${categoryName}".${previousQuestionsContext}

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "question": "The question text here?",
  "correctAnswer": "The correct answer",
  "wrongAnswers": ["Wrong answer 1", "Wrong answer 2", "Wrong answer 3"]
}

Rules:
- Question should be challenging but fair
- All answers should be plausible and similar in length/format
- Correct answer should not be obvious
- Keep answers concise (1-5 words each)`;

	const response = await kmClient.chat(systemPrompt, '', 0.7, 500);

	try {
		const parsed = JSON.parse(response.content);
		const answers = [
			{ id: 'a', text: parsed.correctAnswer },
			{ id: 'b', text: parsed.wrongAnswers[0] },
			{ id: 'c', text: parsed.wrongAnswers[1] },
			{ id: 'd', text: parsed.wrongAnswers[2] }
		];

		// Shuffle answers
		for (let i = answers.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[answers[i], answers[j]] = [answers[j], answers[i]];
		}

		return {
			id: `q-${Date.now()}-${Math.random().toString(36).substring(7)}`,
			text: parsed.question,
			answers,
			correctAnswerId: answers.find((a) => a.text === parsed.correctAnswer)!.id,
			categoryId: categoryName.toLowerCase().replace(/\s+/g, '-')
		};
	} catch (error) {
		console.error('Failed to parse AI response:', error);
		// Fallback question
		return {
			id: `q-${Date.now()}-fallback`,
			text: `What is a fact about ${categoryName}?`,
			answers: [
				{ id: 'a', text: 'Option A' },
				{ id: 'b', text: 'Option B' },
				{ id: 'c', text: 'Option C' },
				{ id: 'd', text: 'Option D' }
			],
			correctAnswerId: 'a',
			categoryId: categoryName.toLowerCase().replace(/\s+/g, '-')
		};
	}
}

/**
 * Generate category options using AI
 */
async function generateCategories(): Promise<Category[]> {
	const systemPrompt = `Generate 4 diverse trivia categories for a party game.

Return ONLY valid JSON array in this exact format (no markdown):
[
  {"name": "Category Name 1", "description": "Brief 1-sentence description"},
  {"name": "Category Name 2", "description": "Brief 1-sentence description"},
  {"name": "Category Name 3", "description": "Brief 1-sentence description"},
  {"name": "Category Name 4", "description": "Brief 1-sentence description"}
]

Categories should be:
- Broad appeal (movies, sports, science, history, pop culture, geography, etc.)
- Not too niche or specialized
- Interesting and engaging for general audiences`;

	const response = await kmClient.chat(systemPrompt, '', 0.8, 400);

	try {
		const parsed = JSON.parse(response.content);
		return parsed.map((cat: { name: string; description: string }) => ({
			id: cat.name.toLowerCase().replace(/\s+/g, '-'),
			name: cat.name,
			description: cat.description
		}));
	} catch (error) {
		console.error('Failed to parse categories:', error);
		// Fallback categories
		return [
			{
				id: 'movies',
				name: 'Movies',
				description: 'Films and cinema from all eras'
			},
			{
				id: 'science',
				name: 'Science',
				description: 'Biology, physics, chemistry and more'
			},
			{
				id: 'history',
				name: 'History',
				description: 'Events and people that shaped our world'
			},
			{
				id: 'sports',
				name: 'Sports',
				description: 'Athletics, competitions and championships'
			}
		];
	}
}

export const gameActions = {
	/**
	 * Start the game and begin category voting phase
	 */
	async setTotalRounds(rounds: number) {
		await kmClient.transact([globalStore], ([globalState]) => {
			globalState.totalRounds = rounds;
		});
	},

	async startGame() {
		const categories = await generateCategories();

		await kmClient.transact([globalStore], ([globalState]) => {
			globalState.started = true;
			globalState.startTimestamp = kmClient.serverTimestamp();
			globalState.gamePhase = 'category-voting';
			globalState.currentRound = 1;
			globalState.categoryVoting = {
				categories,
				votes: {},
				endTimestamp: kmClient.serverTimestamp() + 30000 // 30 seconds
			};
		});

		soundEffects.play('game-start');
	},

	/**
	 * Submit a vote for a category
	 */
	async submitCategoryVote(categoryId: string) {
		await kmClient.transact([globalStore], ([globalState]) => {
			if (globalState.categoryVoting) {
				globalState.categoryVoting.votes[kmClient.id] = categoryId;
			}
		});

		soundEffects.play('vote-cast');
	},

	/**
	 * Transition from category voting to trap selection
	 * Called by global controller
	 */
	async startTrapSelection() {
		// Calculate winning category
		const votes = globalStore.proxy.categoryVoting?.votes || {};
		const voteCounts: Record<string, number> = {};

		Object.values(votes).forEach((categoryId) => {
			voteCounts[categoryId] = (voteCounts[categoryId] || 0) + 1;
		});

		let winningCategoryId = '';
		let maxVotes = 0;
		Object.entries(voteCounts).forEach(([categoryId, count]) => {
			if (count > maxVotes) {
				maxVotes = count;
				winningCategoryId = categoryId;
			}
		});

		// If no votes, pick first category
		if (
			!winningCategoryId &&
			globalStore.proxy.categoryVoting?.categories.length
		) {
			winningCategoryId = globalStore.proxy.categoryVoting.categories[0].id;
		}

		// If still no category (edge case), randomly pick from all categories
		if (!winningCategoryId && globalStore.proxy.categoryVoting?.categories) {
			const categories = globalStore.proxy.categoryVoting.categories;
			if (categories.length > 0) {
				winningCategoryId =
					categories[Math.floor(Math.random() * categories.length)].id;
			}
		}

		await kmClient.transact([globalStore], ([globalState]) => {
			// Store selected category in categoryVoting
			if (globalState.categoryVoting && winningCategoryId) {
				globalState.categoryVoting.selectedCategory = winningCategoryId;
			}

			globalState.gamePhase = 'trap-selection';
			globalState.trapSelection = {
				endTimestamp: kmClient.serverTimestamp() + 30000, // 30 seconds
				selections: {},
				traps: {}
			};
		});

		soundEffects.play('phase-transition');
	},

	/**
	 * Select a trap to throw at another player or double-points for self
	 */
	async selectTrap(selectionType: SelectionType, targetClientId: string) {
		await kmClient.transact(
			[globalStore, playerStore],
			([globalState, playerState]) => {
				if (globalState.trapSelection) {
					// Validate double-points can only be selected on 5th questions
					if (selectionType === 'double-points') {
						const isDoublePointsRound =
							(globalState.totalQuestionsAsked + 1) % 5 === 0;
						if (!isDoublePointsRound) {
							console.error('Double points not available this round');
							return;
						}
						// Set double points for this player
						playerState.hasDoublePoints = true;
						globalState.activeDoublePoints[kmClient.id] = true;
					}

					// Initialize array if not exists
					if (!globalState.trapSelection.traps[kmClient.id]) {
						globalState.trapSelection.traps[kmClient.id] = [];
					}

					// Add the selection
					globalState.trapSelection.traps[kmClient.id].push({
						type: selectionType,
						targetClientId
					});

					// Mark as selected
					globalState.trapSelection.selections[kmClient.id] = true;

					// Store in player state
					playerState.selectedTrap = { type: selectionType, targetClientId };
				}
			}
		);

		// Play appropriate sound
		if (selectionType === 'double-points') {
			soundEffects.play('powerup-activated');
		} else {
			soundEffects.play('trap-activated');
		}
	},

	/**
	 * Clear trap selection
	 */
	async clearTrapSelection() {
		await kmClient.transact([playerStore], ([playerState]) => {
			playerState.selectedTrap = null;
		});
	},

	/**
	 * Pre-generate question in background during timer phases
	 * This eliminates loading delays between phases
	 */
	async pregenerateQuestion() {
		// Don't regenerate if already exists
		if (globalStore.proxy.pregeneratedQuestion) {
			return;
		}

		try {
			console.log('[pregenerateQuestion] Starting background generation...');

			// Get category info - prefer selectedCategory if available
			let winningCategoryId =
				globalStore.proxy.categoryVoting?.selectedCategory || '';

			// If no selectedCategory yet (early pre-generation), calculate from votes
			if (!winningCategoryId) {
				const votes = globalStore.proxy.categoryVoting?.votes || {};
				const voteCounts: Record<string, number> = {};

				Object.values(votes).forEach((categoryId) => {
					voteCounts[categoryId] = (voteCounts[categoryId] || 0) + 1;
				});

				let maxVotes = 0;
				Object.entries(voteCounts).forEach(([categoryId, count]) => {
					if (count > maxVotes) {
						maxVotes = count;
						winningCategoryId = categoryId;
					}
				});
			}

			const category = globalStore.proxy.categoryVoting?.categories.find(
				(c) => c.id === winningCategoryId
			);
			const categoryName = category?.name || 'General Knowledge';

			console.log(
				'[pregenerateQuestion] Generating for category:',
				categoryName
			);

			// Generate question with timeout
			const askedQuestions = globalStore.proxy.askedQuestions || [];

			// Set a 10 second timeout for AI generation
			const timeoutPromise = new Promise<never>((_, reject) => {
				setTimeout(() => reject(new Error('AI timeout')), 10000);
			});

			const generationPromise = generateQuestion(categoryName, askedQuestions);

			// Race between generation and timeout
			const question = await Promise.race([generationPromise, timeoutPromise]);

			console.log('[pregenerateQuestion] Question generated successfully');

			// Store in global state
			await kmClient.transact([globalStore], ([globalState]) => {
				globalState.pregeneratedQuestion = question;
			});
		} catch (error) {
			console.warn('[pregenerateQuestion] Failed, creating fallback:', error);

			// Create a simple fallback question if AI fails or times out
			const category = globalStore.proxy.categoryVoting?.categories.find((c) =>
				Object.values(globalStore.proxy.categoryVoting?.votes || {}).includes(
					c.id
				)
			);
			const categoryName = category?.name || 'General Knowledge';

			const fallbackQuestion: Question = {
				id: `q-${Date.now()}-fallback`,
				text: `What is a fact about ${categoryName}?`,
				answers: [
					{ id: 'a', text: 'Option A' },
					{ id: 'b', text: 'Option B' },
					{ id: 'c', text: 'Option C' },
					{ id: 'd', text: 'Option D' }
				],
				correctAnswerId: 'a',
				categoryId: categoryName.toLowerCase().replace(/\s+/g, '-')
			};

			await kmClient.transact([globalStore], ([globalState]) => {
				globalState.pregeneratedQuestion = fallbackQuestion;
			});
		}
	},

	/**
	 * Start question phase with AI-generated question
	 * Called by global controller after distributing traps
	 */
	async startQuestion() {
		try {
			console.log('[startQuestion] Starting...');

			let question = globalStore.proxy.pregeneratedQuestion;

			// If no pre-generated question, generate now (fallback)
			if (!question) {
				console.log(
					'[startQuestion] No pre-generated question, generating now...'
				);

				// Get category info
				const votes = globalStore.proxy.categoryVoting?.votes || {};
				const voteCounts: Record<string, number> = {};

				Object.values(votes).forEach((categoryId) => {
					voteCounts[categoryId] = (voteCounts[categoryId] || 0) + 1;
				});

				let winningCategoryId = '';
				let maxVotes = 0;
				Object.entries(voteCounts).forEach(([categoryId, count]) => {
					if (count > maxVotes) {
						maxVotes = count;
						winningCategoryId = categoryId;
					}
				});

				const category = globalStore.proxy.categoryVoting?.categories.find(
					(c) => c.id === winningCategoryId
				);
				const categoryName = category?.name || 'General Knowledge';

				const askedQuestions = globalStore.proxy.askedQuestions || [];
				question = await generateQuestion(categoryName, askedQuestions);
			} else {
				console.log('[startQuestion] Using pre-generated question');
			}

			// Get category name for display
			const votes = globalStore.proxy.categoryVoting?.votes || {};
			const voteCounts: Record<string, number> = {};
			Object.values(votes).forEach((categoryId) => {
				voteCounts[categoryId] = (voteCounts[categoryId] || 0) + 1;
			});
			let winningCategoryId = '';
			let maxVotes = 0;
			Object.entries(voteCounts).forEach(([categoryId, count]) => {
				if (count > maxVotes) {
					maxVotes = count;
					winningCategoryId = categoryId;
				}
			});
			const category = globalStore.proxy.categoryVoting?.categories.find(
				(c) => c.id === winningCategoryId
			);
			const categoryName = category?.name || 'General Knowledge';

			// NOW do the transaction with the generated question
			await kmClient.transact([globalStore], ([globalState]) => {
				// Store this question to prevent duplicates
				globalState.askedQuestions.push(question.text);

				// Increment question counter
				globalState.totalQuestionsAsked += 1;

				// Distribute traps to players (filter out double-points)
				const trapsApplied: Record<string, TrapType[]> = {};
				const trapSelections = globalState.trapSelection?.traps || {};

				Object.values(trapSelections).forEach((traps) => {
					traps.forEach((trap) => {
						// Only apply actual traps, not double-points
						if (trap.type !== 'double-points') {
							if (!trapsApplied[trap.targetClientId]) {
								trapsApplied[trap.targetClientId] = [];
							}
							trapsApplied[trap.targetClientId].push(trap.type as TrapType);
						}
					});
				});

				globalState.gamePhase = 'question';
				globalState.currentQuestion = {
					id: question.id,
					text: question.text,
					answers: question.answers,
					correctAnswerId: question.correctAnswerId,
					categoryId: question.categoryId,
					categoryName,
					startTimestamp: kmClient.serverTimestamp(),
					endTimestamp: kmClient.serverTimestamp() + 30000, // 30 seconds
					playerAnswers: {},
					trapsApplied
				};

				// Clear trap selection and pre-generated question
				globalState.trapSelection = null;
				globalState.pregeneratedQuestion = null;
			});

			console.log('[startQuestion] Phase transition complete');
		} catch (error) {
			console.error(
				'[startQuestion] Error during question generation or transition:',
				error
			);
			throw error;
		}
	},

	/**
	 * Submit an answer to the current question
	 */
	async submitAnswer(answerId: string) {
		await kmClient.transact(
			[globalStore, playerStore],
			([globalState, playerState]) => {
				if (globalState.currentQuestion && !playerState.hasAnswered) {
					globalState.currentQuestion.playerAnswers[kmClient.id] = {
						answerId,
						timestamp: kmClient.serverTimestamp()
					};
					playerState.hasAnswered = true;
				}
			}
		);
	},

	/**
	 * Calculate scores and show results
	 * Called by global controller
	 */
	async calculateAndShowResults() {
		await kmClient.transact([globalStore], ([globalState]) => {
			if (!globalState.currentQuestion) return;

			const question = globalState.currentQuestion;
			const results: Record<
				string,
				{
					answerId: string;
					isCorrect: boolean;
					pointsEarned: number;
					timeToAnswer: number;
				}
			> = {};

			// Calculate points for each player
			const playerAnswers = Object.entries(question.playerAnswers);

			// Sort by timestamp (fastest first)
			playerAnswers.sort((a, b) => a[1].timestamp - b[1].timestamp);

			playerAnswers.forEach(([clientId, answer]) => {
				const isCorrect = answer.answerId === question.correctAnswerId;
				const timeToAnswer = answer.timestamp - question.startTimestamp;

				let pointsEarned = 0;
				if (isCorrect) {
					// Linear time decay scoring: maxPoints - (timeElapsed * penalty)
					// Formula ensures fastest answers get highest points
					// 0s = 1000 points (instant), 30s = 100 points (timeout)
					// penalty = 900 points / 30000ms = 0.03 points per millisecond
					const maxPoints = 1000;
					const minPoints = 100;
					const penalty = (maxPoints - minPoints) / 30000;
					pointsEarned = Math.round(
						Math.max(minPoints, maxPoints - timeToAnswer * penalty)
					);

					// Apply double points multiplier if active
					if (globalState.activeDoublePoints[clientId]) {
						pointsEarned *= 2;
					}
				}

				results[clientId] = {
					answerId: answer.answerId,
					isCorrect,
					pointsEarned,
					timeToAnswer
				};

				// Update total score
				globalState.scores[clientId] =
					(globalState.scores[clientId] || 0) + pointsEarned;

				// Play sound effect
				if (clientId === kmClient.id) {
					if (isCorrect) {
						soundEffects.play('correct-answer');
					} else {
						soundEffects.play('incorrect-answer');
					}
				}
			});

			globalState.lastQuestionResult = {
				correctAnswerId: question.correctAnswerId,
				shownTimestamp: kmClient.serverTimestamp(),
				playerResults: results
			};

			globalState.gamePhase = 'question-result';
		});
	},

	/**
	 * Move to next round or final scores
	 * Called by global controller after result display
	 */
	async nextRoundOrEnd() {
		await kmClient.transact(
			[globalStore, playerStore],
			([globalState, playerState]) => {
				// Reset player answered state
				playerState.hasAnswered = false;
				playerState.hasDoublePoints = false;
				playerState.iceTapProgress = {};
				playerState.mudSwipeProgress = {};

				// Clear active double points for all players
				globalState.activeDoublePoints = {};

				if (globalState.currentRound >= globalState.totalRounds) {
					// Game over
					globalState.gamePhase = 'final-scores';
				} else {
					// Next round - start category voting again
					globalState.currentRound += 1;
					globalState.gamePhase = 'trap-selection';
					globalState.trapSelection = {
						endTimestamp: kmClient.serverTimestamp() + 30000,
						selections: {},
						traps: {}
					};
				}
			}
		);
	},

	/**
	 * Reset game to lobby
	 */
	async resetGame() {
		await kmClient.transact([globalStore], ([globalState]) => {
			globalState.started = false;
			globalState.startTimestamp = 0;
			globalState.gamePhase = 'lobby';
			globalState.categoryVoting = null;
			globalState.trapSelection = null;
			globalState.currentQuestion = null;
			globalState.scores = {};
			globalState.currentRound = 0;
			globalState.lastQuestionResult = null;
			globalState.askedQuestions = [];
			globalState.pregeneratedQuestion = null;
			globalState.totalQuestionsAsked = 0;
			globalState.activeDoublePoints = {};
		});
	},

	/**
	 * Update ice trap tap progress
	 */
	async updateIceTapProgress(answerId: string, tapCount: number) {
		await kmClient.transact([playerStore], ([playerState]) => {
			playerState.iceTapProgress[answerId] = tapCount;
		});
	},

	/**
	 * Update mud trap swipe progress
	 */
	async updateMudSwipeProgress(answerId: string, swipeCount: number) {
		await kmClient.transact([playerStore], ([playerState]) => {
			playerState.mudSwipeProgress[answerId] = swipeCount;
		});
	}
};
