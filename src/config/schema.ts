import { z } from 'zod/v4';

export const schema = z.object({
	// translations
	title: z.string().default('Trapz'),

	gameLobbyMd: z
		.string()
		.default(
			'# Waiting for game to start...\nThe game will start once the host presses the start button.'
		),
	connectionsMd: z.string().default('# Connections example'),
	sharedStateMd: z.string().default('# Shared State example'),

	players: z.string().default('Players'),
	timeElapsed: z.string().default('Time elapsed'),
	timeRemaining: z.string().default('Time remaining'),
	startButton: z.string().default('Start Game'),
	stopButton: z.string().default('Stop Game'),
	loading: z.string().default('Loading...'),

	menuTitle: z.string().default('Menu'),
	menuConnections: z.string().default('Connections'),
	menuGameLobby: z.string().default('Lobby'),

	playerNameTitle: z.string().default('Enter Your Name'),
	playerNamePlaceholder: z.string().default('Your name...'),
	playerNameLabel: z.string().default('Name:'),
	playerNameButton: z.string().default('Continue'),

	hostLabel: z.string().default('Host'),
	presenterLabel: z.string().default('Presenter'),

	gameLinksTitle: z.string().default('Game Links'),
	playerLinkLabel: z.string().default('Player Link'),
	presenterLinkLabel: z.string().default('Presenter Link'),

	menuAriaLabel: z.string().default('Open menu drawer'),

	// Game setup
	numberOfRoundsLabel: z.string().default('Number of Rounds:'),
	roundsLabel: z.string().default('rounds'),

	// Category voting
	categoryVotingTitle: z.string().default('Choose a Category'),
	categoryVotingDescription: z
		.string()
		.default('Vote for the trivia category you want to play!'),
	waitingForOtherPlayers: z.string().default('Waiting for other players...'),

	// Trap selection
	trapSelectionTitle: z.string().default('Select a Trap'),
	trapSelectionDescription: z
		.string()
		.default('Choose a trap and target an opponent!'),
	selectTargetPlayer: z.string().default('Select target player:'),
	backButton: z.string().default('Back'),
	trapSelected: z.string().default('Trap selected!'),
	yourSelection: z.string().default('Your selection:'),

	// Question
	trapsActive: z.string().default('Traps active'),
	answerSubmitted: z.string().default('Answer submitted!'),

	// Results
	correct: z.string().default('Correct!'),
	incorrect: z.string().default('Incorrect'),
	pointsEarned: z.string().default('Points earned'),
	yourTime: z.string().default('Your time'),
	yourAnswer: z.string().default('Your answer'),
	correctAnswerWas: z.string().default('Correct answer was'),
	nextRoundStartingSoon: z.string().default('Next round starting soon...'),
	didNotAnswer: z.string().default('You did not answer this question'),

	// Final scores
	finalScoresTitle: z.string().default('Game Over!'),
	yourFinalScore: z.string().default('Your final score'),
	rank: z.string().default('Rank'),
	topPlayers: z.string().default('Top Players'),
	fullLeaderboard: z.string().default('Full Leaderboard'),
	playAgainButton: z.string().default('Play Again')
});

export type Config = z.infer<typeof schema>;
