export type TrapType = 'ice' | 'mud' | 'mixed-letters' | 'missing-letters';

export type GamePhase =
	| 'lobby'
	| 'category-voting'
	| 'trap-selection'
	| 'question'
	| 'question-result'
	| 'final-scores';

export interface Category {
	id: string;
	name: string;
	description: string;
}

export interface Answer {
	id: string;
	text: string;
}

export interface Question {
	id: string;
	text: string;
	answers: Answer[];
	correctAnswerId: string;
	categoryId: string;
}

export interface CategoryVoting {
	categories: Category[];
	votes: Record<string, string>; // clientId -> categoryId
	endTimestamp: number;
}

export interface TrapSelection {
	endTimestamp: number;
	selections: Record<string, boolean>; // clientId -> hasSelected
	traps: Record<string, Array<{ type: TrapType; targetClientId: string }>>; // clientId -> traps they're sending
}

export interface CurrentQuestion {
	id: string;
	text: string;
	answers: Answer[];
	correctAnswerId: string;
	categoryId: string;
	categoryName: string;
	startTimestamp: number;
	endTimestamp: number;
	playerAnswers: Record<string, { answerId: string; timestamp: number }>; // clientId -> answer
	trapsApplied: Record<string, TrapType[]>; // clientId -> traps they received
}

export interface QuestionResult {
	correctAnswerId: string;
	shownTimestamp: number;
	playerResults: Record<
		string,
		{
			answerId: string;
			isCorrect: boolean;
			pointsEarned: number;
			timeToAnswer: number;
		}
	>;
}

export interface TrapDefinition {
	type: TrapType;
	name: string;
	description: string;
	icon: string;
}
