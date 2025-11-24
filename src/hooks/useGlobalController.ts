import { kmClient } from '@/services/km-client';
import { gameActions } from '@/state/actions/game-actions';
import { globalStore } from '@/state/stores/global-store';
import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { useServerTimer } from './useServerTime';

export function useGlobalController() {
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
	const serverTime = useServerTimer(1000); // tick every second

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
			// Count only online players
			const onlinePlayerCount = clientIds.size;
			// Count votes from online players only
			const onlineVoteCount = Object.keys(categoryVoting.votes).filter(
				(clientId) => clientIds.has(clientId)
			).length;
			const allVoted =
				onlineVoteCount >= onlinePlayerCount && onlinePlayerCount > 0;
			const timeExpired = serverTime >= categoryVoting.endTimestamp;

			if (allVoted && categoryVoting.endTimestamp - serverTime > 3000) {
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
			if (timeExpired) {
				gameActions.startTrapSelection();
			}
		}

		// Trap selection phase
		if (gamePhase === 'trap-selection' && trapSelection) {
			// Pre-generate question in the background if not already generated
			if (!globalStore.proxy.pregeneratedQuestion) {
				gameActions.pregenerateQuestion().catch(() => {
					// Silently fail, will generate on-demand if needed
				});
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
			const timeExpired = serverTime >= trapSelection.endTimestamp;

			if (allSelected && trapSelection.endTimestamp - serverTime > 3000) {
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
			if (timeExpired) {
				gameActions.startQuestion().catch((error) => {
					console.error('Failed to start question:', error);
				});
			}
		}

		// Question phase
		if (gamePhase === 'question' && currentQuestion) {
			// Pre-generate next question in the background if not already generated and not last round
			const currentRound = globalStore.proxy.currentRound;
			const totalRounds = globalStore.proxy.totalRounds;
			if (
				!globalStore.proxy.pregeneratedQuestion &&
				currentRound < totalRounds
			) {
				gameActions.pregenerateQuestion().catch(() => {
					// Silently fail, will generate on-demand if needed
				});
			}

			// Count only online players
			const onlinePlayerCount = clientIds.size;
			// Count answers from online players only
			const onlineAnswerCount = Object.keys(
				currentQuestion.playerAnswers
			).filter((clientId) => clientIds.has(clientId)).length;
			const allAnswered =
				onlineAnswerCount >= onlinePlayerCount && onlinePlayerCount > 0;
			const timeExpired = serverTime >= currentQuestion.endTimestamp;

			if (allAnswered && currentQuestion.endTimestamp - serverTime > 3000) {
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
			if (timeExpired) {
				gameActions.calculateAndShowResults();
			}
		}

		// Question result phase - auto-advance after 5 seconds
		if (gamePhase === 'question-result') {
			// Pre-generate next question in the background if not already generated and not last round
			const currentRound = globalStore.proxy.currentRound;
			const totalRounds = globalStore.proxy.totalRounds;
			if (
				!globalStore.proxy.pregeneratedQuestion &&
				currentRound < totalRounds
			) {
				gameActions.pregenerateQuestion().catch(() => {
					// Silently fail, will generate on-demand if needed
				});
			}

			const lastResult = globalStore.proxy.lastQuestionResult;
			if (lastResult && lastResult.shownTimestamp) {
				const timeExpired = serverTime >= lastResult.shownTimestamp + 5000;
				if (timeExpired) {
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
