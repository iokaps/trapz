import { kmClient } from '@/services/km-client';
import { gameActions } from '@/state/actions/game-actions';
import { globalStore } from '@/state/stores/global-store';
import { useEffect, useRef } from 'react';
import { useSnapshot } from 'valtio';
import { useServerTimer } from './useServerTime';

export function useGlobalController() {
	const transitioningRef = useRef(false);
	const {
		controllerConnectionId,
		gamePhase,
		categoryVoting,
		trapSelection,
		currentQuestion
	} = useSnapshot(globalStore.proxy);
	const connections = useSnapshot(globalStore.connections);
	const connectionIds = connections.connectionIds;
	const clientIds = connections.clientIds; // Online client IDs
	const isGlobalController = controllerConnectionId === kmClient.connectionId;
	const serverTime = useServerTimer(100); // Fast polling for responsive transitions

	// Maintain connection that is assigned to be the global controller
	useEffect(() => {
		// Check if global controller is online
		if (connectionIds.has(controllerConnectionId)) {
			return;
		}

		// Select new host, sorting by connection id
		kmClient
			.transact([globalStore], ([globalState]) => {
				const connectionIdsArray = Array.from(connectionIds);
				connectionIdsArray.sort();
				globalState.controllerConnectionId = connectionIdsArray[0] || '';
			})
			.then(() => {})
			.catch(() => {});
	}, [connectionIds, controllerConnectionId]);

	// Run global controller-specific logic for game phase management
	useEffect(() => {
		if (!isGlobalController) {
			return;
		}

		// Category voting phase
		if (gamePhase === 'category-voting' && categoryVoting) {
			// Start pre-generating question early - as soon as category voting starts
			if (!globalStore.proxy.pregeneratedQuestion) {
				gameActions.pregenerateQuestion().catch(() => {
					// Silently fail, will generate on-demand if needed
				});
			}

			// Count only online players
			const onlinePlayerCount = clientIds.size;
			// Count votes from online players only
			const onlineVoteCount = Object.keys(categoryVoting.votes).filter(
				(clientId) => clientIds.has(clientId)
			).length;
			const allVoted =
				onlineVoteCount >= onlinePlayerCount && onlinePlayerCount > 0;
			const remainingTime = categoryVoting.endTimestamp - serverTime;

			if (allVoted && remainingTime > 3000) {
				// All online players voted - start 3 second countdown
				kmClient
					.transact([globalStore], ([globalState]) => {
						if (
							globalState.categoryVoting &&
							globalState.categoryVoting.endTimestamp -
								kmClient.serverTimestamp() >
								3000
						) {
							globalState.categoryVoting.endTimestamp =
								kmClient.serverTimestamp() + 3000;
						}
					})
					.catch(() => {});
			}
			// Transition 500ms before timer to hide any delays
			if (remainingTime <= 500 && !transitioningRef.current) {
				transitioningRef.current = true;
				gameActions.startTrapSelection().catch((error) => {
					console.error('Failed to start trap selection:', error);
					transitioningRef.current = false;
				});
			}
		} else if (gamePhase !== 'category-voting') {
			// Reset transition flag when leaving category voting phase
			transitioningRef.current = false;
		}

		// Trap selection phase
		if (gamePhase === 'trap-selection' && trapSelection) {
			// Ensure question is being pre-generated
			if (!globalStore.proxy.pregeneratedQuestion) {
				gameActions.pregenerateQuestion().catch(() => {});
			}

			// Count only online players
			const onlinePlayerCount = clientIds.size;
			// Count selections from online players only
			const onlineSelectionCount = Object.keys(trapSelection.selections).filter(
				(clientId) =>
					clientIds.has(clientId) && trapSelection.selections[clientId]
			).length;
			const allSelected =
				onlineSelectionCount >= onlinePlayerCount && onlinePlayerCount > 0;
			const remainingTime = trapSelection.endTimestamp - serverTime;

			if (allSelected && remainingTime > 3000) {
				// All online players selected - start 3 second countdown
				kmClient
					.transact([globalStore], ([globalState]) => {
						if (
							globalState.trapSelection &&
							globalState.trapSelection.endTimestamp -
								kmClient.serverTimestamp() >
								3000
						) {
							globalState.trapSelection.endTimestamp =
								kmClient.serverTimestamp() + 3000;
						}
					})
					.catch(() => {});
			}
			// Transition 500ms before timer to hide any delays
			if (remainingTime <= 500) {
				gameActions.startQuestion().catch((error) => {
					console.error('Failed to start question:', error);
				});
			}
		}

		// Question phase
		if (gamePhase === 'question' && currentQuestion) {
			// Pre-generate next question if not last round
			const currentRound = globalStore.proxy.currentRound;
			const totalRounds = globalStore.proxy.totalRounds;
			if (
				!globalStore.proxy.pregeneratedQuestion &&
				currentRound < totalRounds
			) {
				gameActions.pregenerateQuestion().catch(() => {});
			}

			// Count only online players
			const onlinePlayerCount = clientIds.size;
			// Count answers from online players only
			const onlineAnswerCount = Object.keys(
				currentQuestion.playerAnswers
			).filter((clientId) => clientIds.has(clientId)).length;
			const allAnswered =
				onlineAnswerCount >= onlinePlayerCount && onlinePlayerCount > 0;
			const remainingTime = currentQuestion.endTimestamp - serverTime;

			if (allAnswered && remainingTime > 3000) {
				// All online players answered - start 3 second countdown
				kmClient
					.transact([globalStore], ([globalState]) => {
						if (
							globalState.currentQuestion &&
							globalState.currentQuestion.endTimestamp -
								kmClient.serverTimestamp() >
								3000
						) {
							globalState.currentQuestion.endTimestamp =
								kmClient.serverTimestamp() + 3000;
						}
					})
					.catch(() => {});
			}
			// Transition 500ms before timer to hide any delays
			if (remainingTime <= 500) {
				gameActions.calculateAndShowResults();
			}
		}

		// Question result phase
		if (gamePhase === 'question-result') {
			// Pre-generate next question if not last round
			const currentRound = globalStore.proxy.currentRound;
			const totalRounds = globalStore.proxy.totalRounds;
			if (
				!globalStore.proxy.pregeneratedQuestion &&
				currentRound < totalRounds
			) {
				gameActions.pregenerateQuestion().catch(() => {});
			}

			const lastResult = globalStore.proxy.lastQuestionResult;
			if (lastResult && lastResult.shownTimestamp) {
				const remainingTime = lastResult.shownTimestamp + 5000 - serverTime;
				// Transition 500ms before timer to hide any delays
				if (remainingTime <= 500) {
					gameActions.nextRoundOrEnd();
				}
			}
		}
	}, [
		isGlobalController,
		serverTime,
		gamePhase,
		categoryVoting,
		trapSelection,
		currentQuestion,
		connectionIds,
		clientIds
	]);

	return isGlobalController;
}
