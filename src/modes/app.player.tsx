import { PlayerMenu } from '@/components/player/menu';
import { NameLabel } from '@/components/player/name-label';
import { config } from '@/config';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useGlobalController } from '@/hooks/useGlobalController';
import { PlayerLayout } from '@/layouts/player';
import { kmClient } from '@/services/km-client';
import { playerActions } from '@/state/actions/player-actions';
import { globalStore } from '@/state/stores/global-store';
import { playerStore } from '@/state/stores/player-store';
import { CategoryVotingView } from '@/views/category-voting-view';
import { ConnectionsView } from '@/views/connections-view';
import { CreateProfileView } from '@/views/create-profile-view';
import { FinalScoresView } from '@/views/final-scores-view';
import { GameLobbyView } from '@/views/game-lobby-view';
import { QuestionResultView } from '@/views/question-result-view';
import { QuestionView } from '@/views/question-view';
import { TrapSelectionView } from '@/views/trap-selection-view';
import { KmModalProvider } from '@kokimoki/shared';
import * as React from 'react';
import { useSnapshot } from 'valtio';

const App: React.FC = () => {
	const { title } = config;
	const { name, currentView } = useSnapshot(playerStore.proxy);
	const { started, gamePhase } = useSnapshot(globalStore.proxy);

	useGlobalController();
	useDocumentTitle(title);

	// Sync player view with game phase
	React.useEffect(() => {
		if (!started) {
			if (currentView !== 'lobby' && currentView !== 'connections') {
				playerActions.setCurrentView('lobby');
			}
		} else {
			// Map game phase to player view
			const viewMap: Record<typeof gamePhase, typeof currentView> = {
				lobby: 'lobby',
				'category-voting': 'category-voting',
				'trap-selection': 'trap-selection',
				question: 'question',
				'question-result': 'question-result',
				'final-scores': 'final-scores'
			};

			const targetView = viewMap[gamePhase];
			if (currentView !== targetView) {
				playerActions.setCurrentView(targetView);
			}
		}
	}, [started, gamePhase, currentView]);

	// Reset player state when game stops
	React.useEffect(() => {
		if (!started) {
			kmClient
				.transact([playerStore], ([playerState]) => {
					playerState.hasAnswered = false;
					playerState.selectedTrap = null;
					playerState.iceTapProgress = {};
					playerState.mudSwipeProgress = {};
				})
				.catch(() => {});
		}
	}, [started]);

	// Reset hasAnswered when entering trap-selection phase (new round)
	// Only reset trap progress when NOT in question or result phase
	React.useEffect(() => {
		if (
			started &&
			gamePhase === 'trap-selection' &&
			currentView === 'trap-selection'
		) {
			kmClient
				.transact([playerStore], ([playerState]) => {
					playerState.hasAnswered = false;
					playerState.iceTapProgress = {};
					playerState.mudSwipeProgress = {};
				})
				.catch(() => {});
		}
	}, [started, gamePhase, currentView]);

	if (!name) {
		return (
			<PlayerLayout.Root>
				<PlayerLayout.Header />
				<PlayerLayout.Main>
					<CreateProfileView />
				</PlayerLayout.Main>
			</PlayerLayout.Root>
		);
	}

	if (!started) {
		return (
			<KmModalProvider>
				<PlayerLayout.Root>
					<PlayerLayout.Header>
						<PlayerMenu />
					</PlayerLayout.Header>

					<PlayerLayout.Main>
						{currentView === 'lobby' && <GameLobbyView />}
						{currentView === 'connections' && <ConnectionsView />}
					</PlayerLayout.Main>

					<PlayerLayout.Footer>
						<NameLabel name={name} />
					</PlayerLayout.Footer>
				</PlayerLayout.Root>
			</KmModalProvider>
		);
	}

	return (
		<PlayerLayout.Root>
			<PlayerLayout.Header />

			<PlayerLayout.Main>
				{currentView === 'category-voting' && <CategoryVotingView />}
				{currentView === 'trap-selection' && <TrapSelectionView />}
				{currentView === 'question' && <QuestionView />}
				{currentView === 'question-result' && <QuestionResultView />}
				{currentView === 'final-scores' && <FinalScoresView />}
			</PlayerLayout.Main>

			<PlayerLayout.Footer>
				<NameLabel name={name} />
			</PlayerLayout.Footer>
		</PlayerLayout.Root>
	);
};

export default App;
