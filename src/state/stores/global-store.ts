import { kmClient } from '@/services/km-client';
import type {
	CategoryVoting,
	CurrentQuestion,
	GamePhase,
	QuestionResult,
	TrapSelection
} from '@/types/game';

export interface GlobalState {
	controllerConnectionId: string;
	started: boolean;
	startTimestamp: number;
	players: Record<string, { name: string }>;
	gamePhase: GamePhase;
	categoryVoting: CategoryVoting | null;
	trapSelection: TrapSelection | null;
	currentQuestion: CurrentQuestion | null;
	scores: Record<string, number>; // clientId -> total score
	currentRound: number;
	totalRounds: number;
	lastQuestionResult: QuestionResult | null;
	askedQuestions: string[]; // Array of question texts to prevent duplicates
}

const initialState: GlobalState = {
	controllerConnectionId: '',
	started: false,
	startTimestamp: 0,
	players: {},
	gamePhase: 'lobby',
	categoryVoting: null,
	trapSelection: null,
	currentQuestion: null,
	scores: {},
	currentRound: 0,
	totalRounds: 5,
	lastQuestionResult: null,
	askedQuestions: []
};

export const globalStore = kmClient.store<GlobalState>('global', initialState);
