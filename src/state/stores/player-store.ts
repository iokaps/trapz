import { kmClient } from '@/services/km-client';
import type { TrapType } from '@/types/game';

export interface PlayerState {
	name: string;
	currentView:
		| 'lobby'
		| 'shared-state'
		| 'connections'
		| 'category-voting'
		| 'trap-selection'
		| 'question'
		| 'question-result'
		| 'final-scores';
	selectedTrap: { type: TrapType; targetClientId: string } | null;
	hasAnswered: boolean;
	iceTapProgress: Record<string, number>; // answerId -> tap count
	mudSwipeProgress: Record<string, number>; // answerId -> swipe count
}

const initialState: PlayerState = {
	name: '',
	currentView: 'lobby',
	selectedTrap: null,
	hasAnswered: false,
	iceTapProgress: {},
	mudSwipeProgress: {}
};

export const playerStore = kmClient.localStore<PlayerState>(
	'player',
	initialState
);
